#!/usr/bin/env bash
# Sync Kit-Larva brand masters from reportkit-laravel-legacy/assets to all rollout paths.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/reportkit-laravel-legacy/assets"

SVG_FILES=(
  reportkit-icon.svg
  reportkit-icon-small.svg
  reportkit-logo.svg
  reportkit-logo-inverse.svg
  reportkit-mark.svg
  reportkit-og.svg
  reportkit-wordmark.svg
)

PNG_FILES=(
  reportkit-icon.png
  reportkit-logo.png
)

DEST_DIRS=(
  "$ROOT/brand"
  "$ROOT/reportkit-website/assets"
  "$ROOT/reportkit-website/brand"
  "$ROOT/reportkit-website/public/brand"
  "$ROOT/reportkit-ui/assets"
  "$ROOT/reportkit-core/assets"
  "$ROOT/reportkit-laravel/assets"
  "$ROOT/reportkit-laravel-legacy/assets"
)

for dir in "${DEST_DIRS[@]}"; do
  mkdir -p "$dir"
done

for f in "${SVG_FILES[@]}"; do
  cp -f "$SRC/$f" "$ROOT/brand/$f"
done

for f in "${PNG_FILES[@]}"; do
  cp -f "$SRC/$f" "$ROOT/brand/$f"
done

if [[ -d "$SRC/animated" ]]; then
  mkdir -p "$ROOT/brand/animated"
  cp -f "$SRC/animated/"* "$ROOT/brand/animated/" 2>/dev/null || true
fi

for dir in "${DEST_DIRS[@]}"; do
  [[ "$dir" == "$ROOT/brand" ]] && continue
  for f in "${SVG_FILES[@]}"; do
    cp -f "$ROOT/brand/$f" "$dir/$f"
  done
  for f in "${PNG_FILES[@]}"; do
    cp -f "$ROOT/brand/$f" "$dir/$f"
  done
  if [[ -d "$ROOT/brand/animated" ]]; then
    mkdir -p "$dir/animated"
    cp -f "$ROOT/brand/animated/"* "$dir/animated/" 2>/dev/null || true
  fi
done

# README / Packagist PNG exports (1200px wide logo, common icon sizes)
PNG_OUT="$ROOT/brand/png"
mkdir -p "$PNG_OUT"

rsvg-convert -w 1200 "$ROOT/brand/reportkit-logo.svg" -o "$PNG_OUT/reportkit-logo-1200.png"
rsvg-convert -w 1200 "$ROOT/brand/reportkit-logo-inverse.svg" -o "$PNG_OUT/reportkit-logo-inverse-1200.png"
rsvg-convert -w 1024 "$ROOT/brand/reportkit-mark.svg" -o "$PNG_OUT/reportkit-mark-1024.png"
rsvg-convert -w 512 "$ROOT/brand/reportkit-icon.svg" -o "$PNG_OUT/reportkit-icon-512.png"
rsvg-convert -w 1000 "$ROOT/brand/reportkit-wordmark.svg" -o "$PNG_OUT/reportkit-wordmark-1000.png"
rsvg-convert -w 1200 "$ROOT/brand/reportkit-og.svg" -o "$PNG_OUT/reportkit-og.png"

cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-website/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-ui/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-core/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-laravel/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-laravel-legacy/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-logo-1200.png" "$ROOT/reportkit-website/public/reportkit-logo.png"

mkdir -p "$ROOT/reportkit-website/public/brand/png"
cp -f "$PNG_OUT/"*.png "$ROOT/reportkit-website/public/brand/png/"

echo "Brand sync complete."
