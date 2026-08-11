#!/usr/bin/env bash
# Lorapok ReportKit — fictional Laravel demo bootstrap helper
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO="$(cd "$ROOT/../.." && pwd)"

echo "ReportKit laravel-demo setup"
echo "  demo root:   $ROOT"
echo "  monorepo:    $MONOREPO"
echo ""

if [[ ! -f "$ROOT/composer.json" ]]; then
  echo "composer.json missing — run from examples/laravel-demo" >&2
  exit 1
fi

cd "$ROOT"

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer is required. Install packages manually:" >&2
  echo "  cd examples/laravel-demo && composer install" >&2
  exit 1
fi

composer install --no-interaction

echo ""
echo "Next steps (inside your Laravel host app that uses this path repo):"
echo "  1. php artisan reportkit:install --with-config --publish-assets"
echo "  2. php artisan reportkit:make OperatorExport --preset=hybrid-export --route=admin/operator-export"
echo "  3. sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql"
echo "  4. Wire routes from routes/reportkit-demo.php.example"
echo ""
echo "See SCAFFOLD.md for the full fictional host checklist."
