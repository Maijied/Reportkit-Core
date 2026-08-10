#!/usr/bin/env bash
# Migrate ReportKit demo API from nested api.reportkit.lorapok.tech
# to single-level reportkit-api.lorapok.tech (Free Universal SSL).
set -euo pipefail

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?Missing CLOUDFLARE_ACCOUNT_ID}"
TOKEN="$(printf '%s' "${CLOUDFLARE_API_TOKEN:?Missing CLOUDFLARE_API_TOKEN}" | tr -d '\r\n' | sed 's/^Bearer //')"
OLD_HOST="api.reportkit.lorapok.tech"
NEW_HOST="reportkit-api.lorapok.tech"
SERVICE="reportkit-demo-api"
ZONE_NAME="lorapok.tech"

CF_HTTP=""
CF_BODY=""

cf_request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local tmp
  tmp="$(mktemp)"
  if [[ -n "$body" ]]; then
    CF_HTTP="$(curl -sS -w '%{http_code}' -o "$tmp" \
      -X "$method" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$url")"
  else
    CF_HTTP="$(curl -sS -w '%{http_code}' -o "$tmp" \
      -X "$method" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      "$url")"
  fi
  CF_BODY="$(cat "$tmp")"
  rm -f "$tmp"
}

api_ok() {
  [[ "$CF_HTTP" =~ ^2 ]] && { [[ -z "$CF_BODY" ]] || echo "$CF_BODY" | jq -e '.success == true' >/dev/null 2>&1; }
}

require_api() {
  local label="$1"
  if api_ok; then
    return 0
  fi
  echo "::error::${label} failed (HTTP ${CF_HTTP}): ${CF_BODY:-<empty>}"
  exit 1
}

warn_api() {
  local label="$1"
  if api_ok; then
    return 0
  fi
  echo "::warning::${label} failed (HTTP ${CF_HTTP}): ${CF_BODY:-<empty>}"
}

echo "== Resolve zone ${ZONE_NAME}"
cf_request GET "https://api.cloudflare.com/client/v4/zones?name=${ZONE_NAME}"
require_api "Zone lookup"
ZONE_ID="$(echo "$CF_BODY" | jq -r '.result[0].id')"
test -n "$ZONE_ID" && test "$ZONE_ID" != "null"
echo "Zone ID: ${ZONE_ID}"

echo "== List Worker custom domains"
cf_request GET "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains"
require_api "List worker domains"
echo "$CF_BODY" | jq -r '.result[] | "\(.id)\t\(.hostname)\t\(.service)"'

if echo "$CF_BODY" | jq -e --arg h "$NEW_HOST" '.result[] | select(.hostname == $h)' >/dev/null; then
  echo "== ${NEW_HOST} already attached"
else
  echo "== Attach ${NEW_HOST} to ${SERVICE}"
  ATTACH_BODY="$(jq -nc \
    --arg hostname "$NEW_HOST" \
    --arg service "$SERVICE" \
    --arg zone_id "$ZONE_ID" \
    '{hostname: $hostname, service: $service, environment: "production", zone_id: $zone_id}')"
  cf_request PUT "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains" "$ATTACH_BODY"
  require_api "Attach ${NEW_HOST}"
fi

OLD_IDS="$(echo "$CF_BODY" | jq -r --arg h "$OLD_HOST" '.result[] | select(.hostname == $h) | .id')"
for id in $OLD_IDS; do
  echo "== Detach ${OLD_HOST} (${id})"
  cf_request DELETE "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains/${id}"
  warn_api "Detach ${OLD_HOST}"
done

echo "== Remove failed Advanced certificate for ${OLD_HOST} (if present)"
cf_request GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/ssl/certificate_packs?status=all"
if api_ok; then
  OLD_CERT_IDS="$(echo "$CF_BODY" | jq -r --arg h "$OLD_HOST" '
    .result[]?
    | select((.hosts[]? // empty) == $h or (.certificates[]?.hosts[]? // empty) == $h)
    | .id')"
  for cert_id in $OLD_CERT_IDS; do
    echo "Deleting certificate pack ${cert_id}"
    cf_request DELETE "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/ssl/certificate_packs/${cert_id}"
    warn_api "Delete certificate ${cert_id}"
  done
else
  warn_api "List certificate packs"
fi

echo "== Enable recommended SSL/TLS zone settings"
set_zone_setting() {
  local id="$1"
  local value="$2"
  cf_request PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/${id}" "$(jq -nc --arg v "$value" '{value: $v}')"
  if api_ok; then
    echo "  ${id} = ${value}"
  else
    warn_api "Set ${id}"
  fi
}

set_zone_setting ssl strict
set_zone_setting always_use_https on
set_zone_setting min_tls_version 1.2
set_zone_setting tls_1_3 on
set_zone_setting automatic_https_rewrites on

echo "== Wait for ${NEW_HOST} TLS (up to 5 min)"
for i in $(seq 1 30); do
  if curl -fsS --max-time 10 "https://${NEW_HOST}/v1/health" >/tmp/rk-health.json 2>/dev/null; then
    echo "Health OK:"
    cat /tmp/rk-health.json
    exit 0
  fi
  echo "  attempt ${i}/30 — not ready yet"
  sleep 10
done

echo "::error::${NEW_HOST} did not become healthy within 5 minutes"
curl -vk "https://${NEW_HOST}/v1/health" || true
exit 1
