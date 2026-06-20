#!/usr/bin/env bash
# Run the detection backend and the Next.js dev server together.
# Usage: ./scripts/dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -x backend/.venv/bin/uvicorn ]; then
  echo "Backend venv missing. Run: python3 -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

export NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-http://localhost:8000}"

backend/.venv/bin/uvicorn backend.main:app --port 8000 &
API_PID=$!
trap 'kill $API_PID 2>/dev/null || true' EXIT

npm run dev
