#!/usr/bin/env bash
# Verify reportkit/* Packagist packages point at the monorepo.
set -euo pipefail

MONOREPO='https://github.com/Maijied/Reportkit-Core'
STRICT=false
PACKAGES=(core laravel laravel-legacy)

usage() {
  echo "Usage: $0 [--strict]"
  echo "  --strict  exit 1 if any package is not on ${MONOREPO}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict) STRICT=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 2 ;;
  esac
done

fail=0
printf '%-24s %-52s %s\n' 'PACKAGE' 'REPOSITORY' 'STATUS'
printf '%s\n' '--------------------------------------------------------------------------------'

for slug in "${PACKAGES[@]}"; do
  name="reportkit/${slug}"
  url="$(curl -fsS "https://packagist.org/packages/${name}.json" | jq -r '.package.repository // empty')"
  if [[ -z "$url" ]]; then
    status='MISSING'
    fail=1
    [[ -n "${GITHUB_ACTIONS:-}" ]] && echo "::error title=${name}::No repository URL on Packagist"
  elif [[ "$url" == "$MONOREPO" ]]; then
    status='OK'
  else
    status='WRONG'
    fail=1
    [[ -n "${GITHUB_ACTIONS:-}" ]] && echo "::error title=${name}::Repository is ${url} — set to ${MONOREPO} (see PACKAGIST-MONOREPO.md Process A/B)"
  fi
  printf '%-24s %-52s %s\n' "$name" "${url:-<none>}" "$status"
done

echo
if [[ "$fail" -eq 0 ]]; then
  echo "All packages point at ${MONOREPO}"
  exit 0
fi

echo "Fix repository URLs on packagist.org — see reportkit-website/docs/PACKAGIST-MONOREPO.md"
if [[ "$STRICT" == true ]]; then
  exit 1
fi
exit 0
