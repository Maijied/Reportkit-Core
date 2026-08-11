#!/usr/bin/env bash
# Lorapok ReportKit — install and boot the fictional Laravel demo host
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO="$(cd "$ROOT/../.." && pwd)"

echo "ReportKit laravel-demo install"
echo "  demo:     $ROOT"
echo "  monorepo: $MONOREPO"

cd "$ROOT"

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer required." >&2
  exit 1
fi

composer install --no-interaction

if [[ ! -f .env ]]; then
  cp .env.example .env
  php -r "file_put_contents('.env', str_replace('APP_KEY=', 'APP_KEY=base64:'.base64_encode(random_bytes(32)), file_get_contents('.env')));"
fi

mkdir -p public/css/reportkit public/js/reportkit public/js/reports database storage/framework/{sessions,views,cache} storage/logs bootstrap/cache

cp -f "$MONOREPO/reportkit-ui/css/reportkit.css" public/css/reportkit/
cp -f "$MONOREPO/reportkit-ui/css/reportkit-compat.css" public/css/reportkit/ 2>/dev/null || true
cp -f "$MONOREPO/reportkit-ui/js/reportkit.js" "$MONOREPO/reportkit-ui/js/lldp-core.js" "$MONOREPO/reportkit-ui/js/lldp-download.js" public/js/reportkit/

if [[ ! -f database/demo.sqlite ]]; then
  sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql
  echo "Created database/demo.sqlite with fictional fixtures."
fi

echo ""
echo "Start the demo:"
echo "  cd examples/laravel-demo"
echo "  php -S localhost:8080 -t public"
echo ""
echo "Open http://localhost:8080/admin/operator-export"
