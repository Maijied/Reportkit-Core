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

cf() {
  if [[ $# -eq 1 ]]; then
    curl -sS \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      "$1"
    return
  fi
  local method="$1"
  shift
  curl -sS \
    -X "$method" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

cf_json() {
  local method="${1:-GET}"
  shift
  local url="$1"
  shift
  local body="${1:-}"
  if [[ -n "$body" ]]; then
    cf "$method" "$url" -d "$body"
  else
    cf "$method" "$url"
  fi
}

require_success() {
  local label="$1"
  local json="$2"
  local ok
  ok="$(echo "$json" | jq -r '.success')"
  if [[ "$ok" != "true" ]]; then
    echo "::error::${label} failed: $(echo "$json" | jq -c '.errors // .messages // .')"
    exit 1
  fi
}

echo "== Resolve zone ${ZONE_NAME}"
ZONE_JSON="$(cf "https://api.cloudflare.com/client/v4/zones?name=${ZONE_NAME}")"
require_success "Zone lookup" "$ZONE_JSON"
ZONE_ID="$(echo "$ZONE_JSON" | jq -r '.result[0].id')"
test -n "$ZONE_ID" && test "$ZONE_ID" != "null"
echo "Zone ID: ${ZONE_ID}"

echo "== List Worker custom domains"
DOMAINS_JSON="$(cf "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains")"
require_success "List worker domains" "$DOMAINS_JSON"
echo "$DOMAINS_JSON" | jq -r '.result[] | "\(.id)\t\(.hostname)\t\(.service)"'

OLD_IDS="$(echo "$DOMAINS_JSON" | jq -r --arg h "$OLD_HOST" '.result[] | select(.hostname == $h) | .id')"
for id in $OLD_IDS; do
  echo "== Detach ${OLD_HOST} (${id})"
  DEL_JSON="$(cf_json DELETE "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains/${id}")"
  require_success "Detach ${OLD_HOST}" "$DEL_JSON"
done

if echo "$DOMAINS_JSON" | jq -e --arg h "$NEW_HOST" '.result[] | select(.hostname == $h)' >/dev/null; then
  echo "== ${NEW_HOST} already attached"
else
  echo "== Attach ${NEW_HOST} to ${SERVICE}"
  ATTACH_BODY="$(jq -nc \
    --arg hostname "$NEW_HOST" \
    --arg service "$SERVICE" \
    --arg zone_id "$ZONE_ID" \
    '{hostname: $hostname, service: $service, environment: "production", zone_id: $zone_id}')"
  ATTACH_JSON="$(cf_json PUT "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains" "$ATTACH_BODY")"
  require_success "Attach ${NEW_HOST}" "$ATTACH_JSON"
fi

echo "== Remove failed Advanced certificate for ${OLD_HOST} (if present)"
CERT_JSON="$(cf "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/ssl/certificate_packs?status=all")"
if echo "$CERT_JSON" | jq -e '.success == true' >/dev/null; then
  OLD_CERT_IDS="$(echo "$CERT_JSON" | jq -r --arg h "$OLD_HOST" '
    .result[]?
    | select((.hosts[]? // empty) == $h or (.certificates[]?.hosts[]? // empty) == $h)
    | .id')"
  for cert_id in $OLD_CERT_IDS; do
    echo "Deleting certificate pack ${cert_id}"
    DEL_CERT="$(cf_json DELETE "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/ssl/certificate_packs/${cert_id}")" || true
    echo "$DEL_CERT" | jq -c '{success, errors}' || echo "$DEL_CERT"
  done
else
  echo "::warning::Could not list certificate packs (token may lack SSL read). Skip manual delete in dashboard if needed."
fi

echo "== Enable recommended SSL/TLS zone settings"
set_zone_setting() {
  local id="$1"
  local value="$2"
  local json
  json="$(cf_json PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/${id}" "$(jq -nc --arg v "$value" '{value: $v}')")"
  if echo "$json" | jq -e '.success == true' >/dev/null; then
    echo "  ${id} = ${value}"
  else
    echo "::warning::Could not set ${id}: $(echo "$json" | jq -c '.errors // .')"
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
