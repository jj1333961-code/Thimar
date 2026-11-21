#!/usr/bin/env bash
set -euo pipefail

ASSETS_DIR="${1:-downloads-site/assets}"
METADATA_FILE="${2:-public/updates/android.json}"

if [[ ! -f "$METADATA_FILE" ]]; then
  echo "Metadata file not found: $METADATA_FILE" >&2
  exit 1
fi
if [[ ! -d "$ASSETS_DIR" ]]; then
  echo "Assets directory not found: $ASSETS_DIR" >&2
  exit 1
fi

CURRENT_FILE="$(python3 - <<PY
import json
data = json.load(open("$METADATA_FILE"))
print(data.get("fileName", ""))
PY
)"

if [[ -z "$CURRENT_FILE" ]]; then
  echo "Current release fileName is missing in metadata" >&2
  exit 1
fi
if [[ ! -f "$ASSETS_DIR/$CURRENT_FILE" ]]; then
  echo "Current release APK is missing: $ASSETS_DIR/$CURRENT_FILE" >&2
  exit 1
fi

echo "Current production APK retained: $CURRENT_FILE"

deleted=0
for apk in "$ASSETS_DIR"/thimar-*.apk; do
  [[ -f "$apk" ]] || continue
  base="$(basename "$apk")"

  # Never remove test releases or the current production release.
  if [[ "$base" == *-test.apk ]]; then
    echo "Retained test APK: $base"
    continue
  fi
  if [[ "$base" == "$CURRENT_FILE" ]]; then
    echo "Retained current production APK: $base"
    continue
  fi

  # Only remove versioned production APKs, e.g. thimar-1.9.4.apk.
  if [[ "$base" =~ ^thimar-[0-9].*\.apk$ ]]; then
    echo "Deleting obsolete production APK: $base"
    rm -f "$apk"
    deleted=$((deleted + 1))
  else
    echo "Retained non-versioned file: $base"
  fi
done

echo "Cleanup complete. Deleted $deleted obsolete production APK(s)."
