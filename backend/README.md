# Anicca Vision detection backend

FastAPI service that runs the real detection pipeline (YOLOv8s + ByteTrack +
EasyOCR) on traffic clips, stores results in SQLite, and serves them to the
dashboard. The Next.js frontend reads from `/api/feeds` and falls back to the
static data in `data/traffic.ts` when this service is not running.

## Setup

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

## Run (from the repo root)

```bash
backend/.venv/bin/uvicorn backend.main:app --port 8000
```

Point the frontend at it with `NEXT_PUBLIC_API_BASE=http://localhost:8000`
(see `.env.local`). Without it the dashboard uses the bundled static data.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/health` | liveness check |
| GET  | `/api/feeds` | all analyzed feeds (full documents) |
| POST | `/api/reanalyze?feedId=<id>` | re-run detection on a seed clip (omit `feedId` for all) |
| POST | `/api/upload` | multipart `file` (+ optional `title`, `area`) → new analyzed feed |
| GET  | `/api/jobs/{id}` | analysis job status (`queued`/`running`/`done`/`error`) |

Jobs run on a single worker thread (the YOLO tracker is stateful and shared),
so analyses are processed one at a time. Uploaded videos are written to
`videos/` so the existing Next.js `/api/video/...` route can stream them.

`anicca.db` is created on first run and is git-ignored.
