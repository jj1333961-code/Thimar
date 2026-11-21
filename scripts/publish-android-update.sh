#!/usr/bin/env bash
set -euo pipefail

METADATA_URL="${METADATA_URL:-https://thimar.freebuff.page/updates/android.json}"
FUNCTION_URL="${SUPABASE_FUNCTION_URL:-https://jbsvmpiwdwowizzfzlqr.supabase.co/functions/v1/send-update-notification}"

if [[ -z "${THIMAR_PUSH_SECRET:-}" ]]; then
  echo "THIMAR_PUSH_SECRET is required" >&2
  exit 1
fi

echo "Validating release metadata at ${METADATA_URL}..."
curl -fsS "${METADATA_URL}" >/tmp/thimar-android.json

python3 - <<'PY'
import json,sys
data=json.load(open('/tmp/thimar-android.json'))
required=['available','versionName','versionCode','downloadUrl','fileSize','sha256']
missing=[k for k in required if k not in data or data.get(k) in (None,'')]
if missing or data.get('available') is not True:
    print('Invalid or unpublished release metadata:', missing, file=sys.stderr)
    sys.exit(1)
print('Release metadata valid:', data['versionName'], data['versionCode'])
PY

echo "Invoking update notification function..."
curl -fsS -X POST "${FUNCTION_URL}" \
  -H "Authorization: Bearer ${THIMAR_PUSH_SECRET}" \
  -H "Content-Type: application/json" \
  -d "{\"metadataUrl\":\"${METADATA_URL}\"}"