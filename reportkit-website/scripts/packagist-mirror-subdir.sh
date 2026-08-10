#!/usr/bin/env bash
# Mirror a monorepo subdirectory to a standalone GitHub repo for Packagist.
# Packagist.org (free) requires composer.json at the repository root — subdirs are not supported.
set -euo pipefail

SUBDIR="${1:?Usage: $0 <subdir> <target-repo> [tag-prefix]}"
TARGET="${2:?}"
TAG_PREFIX="${3:-}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

AUTH=""
if [[ -n "${GH_TOKEN:-}" ]]; then
  AUTH="https://x-access-token:${GH_TOKEN}@"
fi

echo "== Mirror ${SUBDIR}/ → ${TARGET}"

git clone --depth 1 "${AUTH}github.com/${TARGET}.git" "$WORK/out" 2>/dev/null || {
  mkdir -p "$WORK/out"
  git -C "$WORK/out" init -b main
  git -C "$WORK/out" remote add origin "${AUTH}github.com/${TARGET}.git"
}

rsync -a --delete \
  --exclude '.git' \
  --exclude 'vendor' \
  --exclude 'node_modules' \
  "${ROOT}/${SUBDIR}/" "${WORK}/out/"

cd "$WORK/out"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
if git diff --cached --quiet; then
  echo "No content changes on main"
else
  git commit -m "Mirror from Maijied/Reportkit-Core/${SUBDIR} ($(date -u +%Y-%m-%dT%H:%MZ))"
  git push origin HEAD:main
fi

if [[ -n "$TAG_PREFIX" ]]; then
  cd "$ROOT"
  mapfile -t TAGS < <(git tag -l "${TAG_PREFIX}v*" | sort -V)
  for tag in "${TAGS[@]}"; do
    version="${tag#${TAG_PREFIX}v}"
    plain_tag="v${version}"
    echo "== Mirror tag ${tag} → ${TARGET}@${plain_tag}"
    rm -rf "$WORK/stage"
    mkdir -p "$WORK/stage"
    git archive "$tag" "${SUBDIR}" | tar -x -C "$WORK/stage"
    rsync -a --delete "${WORK}/stage/${SUBDIR}/" "${WORK}/out/"
    cd "$WORK/out"
    git add -A
    git commit -m "Release ${plain_tag} (from Reportkit-Core ${tag})" --allow-empty
    git tag -fa "$plain_tag" -m "Synced from Reportkit-Core ${tag}"
    git push origin main
    git push origin "$plain_tag" --force
  done
fi

echo "Done: https://github.com/${TARGET}"
