#!/usr/bin/env bash
# Apply research seed batches to remote D1 (run locally after: npm run seed:sql)
set -euo pipefail
cd "$(dirname "$0")/.."
SCALE="${SEED_SCALE:-research}"
export SEED_SCALE="$SCALE"
npm run seed:sql
MANIFEST="seed/batches/manifest.json"
if [ ! -f "$MANIFEST" ]; then echo "Missing $MANIFEST — run npm run seed:sql first"; exit 1; fi
echo "Applying schema..."
npx wrangler d1 execute reportkit_live --remote --file=./schema/live.sql
npx wrangler d1 execute reportkit_archive --remote --file=./schema/archive.sql
echo "Applying live batches..."
for f in seed/batches/live.*.sql; do
  [ -f "$f" ] || continue
  echo "  $f"
  npx wrangler d1 execute reportkit_live --remote --file="$f"
done
npx wrangler d1 execute reportkit_live --remote --file=./seed/live.meta.sql
echo "Applying archive batches..."
for f in seed/batches/archive.*.sql; do
  [ -f "$f" ] || continue
  echo "  $f"
  npx wrangler d1 execute reportkit_archive --remote --file="$f"
done
npx wrangler d1 execute reportkit_archive --remote --file=./seed/archive.meta.sql
echo "Done ($SCALE)."
