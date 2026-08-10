#!/usr/bin/env bash
# Verify Packagist repository URLs for ReportKit PHP packages.
set -euo pipefail

MONOREPO='https://github.com/Maijied/Reportkit-Core'
LARAVEL_MIRROR='https://github.com/Maijied/Reportkit-Laravel'
LEGACY_MIRROR='https://github.com/Maijied/Reportkit-Laravel-Legacy'
STRICT=false

usage() {
  echo "Usage: $0 [--strict]"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict) STRICT=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 2 ;;
  esac
done

check() {
  local name="$1"
  local expected="$2"
  local url
  url="$(curl -fsS "https://packagist.org/packages/${name}.json" | jq -r '.package.repository // empty')"
  local status="OK"
  if [[ -z "$url" ]]; then
    status="MISSING"
  elif [[ "$url" != "$expected" ]]; then
    status="WRONG"
  fi
  printf '%-28s %-52s %s\n' "$name" "${url:-<none>}" "$status"
  if [[ "$status" != "OK" ]]; then
    return 1
  fi
  return 0
}

fail=0
printf '%-28s %-52s %s\n' 'PACKAGE' 'REPOSITORY' 'STATUS'
printf '%s\n' '--------------------------------------------------------------------------------'

check 'reportkit/core' "$MONOREPO" || fail=1
check 'reportkit/laravel' "$LARAVEL_MIRROR" || fail=1
check 'reportkit/laravel-legacy' "$LEGACY_MIRROR" || fail=1

echo
if [[ "$fail" -eq 0 ]]; then
  echo "All Packagist URLs match the expected layout (core=monorepo, Laravel adapters=mirror repos)."
  exit 0
fi

echo "See reportkit-website/docs/PACKAGIST-MONOREPO.md"
echo "Run: gh workflow run packagist-mirror-sync.yml --repo Maijied/Reportkit-Core"
if [[ "$STRICT" == true ]]; then
  exit 1
fi
exit 0
