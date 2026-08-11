#!/usr/bin/env bash
# Sync Kit-Larva brand masters from brand/ to all rollout paths and export PNGs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MASTER="$ROOT/brand"

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

for dir in "${DEST_DIRS[@]}"; do
  [[ "$dir" == "$MASTER" ]] && continue
  for f in "${SVG_FILES[@]}"; do
    cp -f "$MASTER/$f" "$dir/$f"
  done
  for f in "${PNG_FILES[@]}"; do
    [[ -f "$MASTER/$f" ]] && cp -f "$MASTER/$f" "$dir/$f"
  done
  if [[ -d "$MASTER/animated" ]]; then
    mkdir -p "$dir/animated"
    cp -f "$MASTER/animated/"* "$dir/animated/" 2>/dev/null || true
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

cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-website/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-ui/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-core/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-laravel/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-laravel-legacy/assets/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-website/public/reportkit-logo.png"
cp -f "$PNG_OUT/reportkit-mark-1024.png" "$ROOT/reportkit-website/public/reportkit-mark.png"

mkdir -p "$ROOT/reportkit-website/public/brand/png"
cp -f "$PNG_OUT/"*.png "$ROOT/reportkit-website/public/brand/png/"

echo "Brand sync complete."
