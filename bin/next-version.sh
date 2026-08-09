#!/usr/bin/env bash
# Compute the next SemVer tag for ReportKit monorepo packages.
# Usage: next-version.sh <channel> <bump> [latest_tag] [tag_prefix]
# tag_prefix examples: core/  laravel/  ui/
set -euo pipefail

CHANNEL="${1:-beta}"
BUMP="${2:-prerelease}"
LATEST="${3:-}"
PREFIX="${4:-}"

if [ -z "$LATEST" ]; then
  LATEST="$(git tag -l "${PREFIX}v*" --sort=-v:refname | head -n1 || true)"
fi
if [ -z "$LATEST" ]; then
  LATEST="${PREFIX}v0.0.0"
fi

RAW="${LATEST#"${PREFIX}"}"
RAW="${RAW#v}"
BASE="${RAW%%-*}"
PRE=""
if [[ "$RAW" == *-* ]]; then
  PRE="${RAW#*-}"
fi

IFS=. read -r MAJOR MINOR PATCH <<<"$BASE"
MAJOR=${MAJOR:-0}
MINOR=${MINOR:-0}
PATCH=${PATCH:-0}

PRE_NAME=""
PRE_NUM=0
if [ -n "$PRE" ]; then
  PRE_NAME="${PRE%%.*}"
  REST="${PRE#*.}"
  if [[ "$REST" =~ ^[0-9]+$ ]]; then
    PRE_NUM="$REST"
  else
    PRE_NUM=0
  fi
fi

bump_base() {
  case "$1" in
    major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
    patch) PATCH=$((PATCH + 1)) ;;
  esac
}

case "$CHANNEL" in
  beta|rc)
    case "$BUMP" in
      major|minor|patch)
        bump_base "$BUMP"
        PRE_NAME="$CHANNEL"
        PRE_NUM=1
        ;;
      prerelease|*)
        if [ -n "$PRE_NAME" ] && [ "$PRE_NAME" = "$CHANNEL" ]; then
          PRE_NUM=$((PRE_NUM + 1))
        elif [ -n "$PRE_NAME" ]; then
          PRE_NAME="$CHANNEL"
          PRE_NUM=1
        else
          bump_base patch
          PRE_NAME="$CHANNEL"
          PRE_NUM=1
        fi
        ;;
    esac
    echo "${PREFIX}v${MAJOR}.${MINOR}.${PATCH}-${PRE_NAME}.${PRE_NUM}"
    ;;
  stable)
    case "$BUMP" in
      major) bump_base major ;;
      minor) bump_base minor ;;
      patch) bump_base patch ;;
      prerelease)
        if [ -z "$PRE_NAME" ]; then
          bump_base patch
        fi
        ;;
    esac
    echo "${PREFIX}v${MAJOR}.${MINOR}.${PATCH}"
    ;;
  *)
    echo "Unknown channel: $CHANNEL" >&2
    exit 1
    ;;
esac
