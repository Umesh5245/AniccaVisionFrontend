"""FastAPI service: analyze traffic videos on demand and serve results.

Run from the repo root:
    backend/.venv/bin/uvicorn backend.main:app --reload --port 8000
"""
import datetime
import re
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import backend.db as db
from backend.detection import analyze_video

ROOT = Path(__file__).resolve().parent.parent
VIDEOS_DIR = ROOT / "videos"
EXEC = ThreadPoolExecutor(max_workers=1)  # serialize jobs: one shared YOLO tracker

# The seed clips that ship with the repo, for the "re-analyze" action.
KNOWN_CLIPS = {
    "bangalore-flow": ("Bangalore Traffic Flow", "Main Street", "demo_bangalore_traffic_h264.mp4", "Live", "Signal queue rising"),
    "congestion": ("Congestion Monitoring", "City Center", "Congestion_h264.mp4", "Live", "Peak congestion"),
    "no-parking": ("No Parking Detection", "Market Road", "no_parking_h264.mp4", "Review", "Restricted bay activity"),
    "plate-capture": ("License Plate Capture", "Toll Junction", "license_number.mp4", "Review", "Plate OCR sample"),
    "junction-eight": ("Junction Camera 8", "Ring Road", "media8_h264.mp4", "Live", "Wrong-lane watch"),
}

app = FastAPI(title="Anicca Vision Detection API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def fmt_of(filename):
    ext = Path(filename).suffix.lower().lstrip(".")
    return ext if ext in {"mp4", "mov", "avi"} else "mp4"


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", Path(name).stem.lower()).strip("-")
    return s or "feed"


def _run_job(job_id, feed_id, position, meta):
    """meta: (title, area, file, status, highlight)"""
    title, area, file, status, highlight = meta
    path = str(VIDEOS_DIR / file)
    db.update_job(job_id, "running", now_iso())
    try:
        doc = analyze_video(
            feed_id, path, title=title, area=area, file=file,
            fmt=fmt_of(file), status=status, highlight=highlight,
        )
        ts = now_iso()
        doc["analyzedAt"] = ts
        db.upsert_feed(doc, position, ts)
        db.insert_run(feed_id, doc["vehicles"], doc["violations"], doc["confidence"], ts)
        db.update_job(job_id, "done", ts)
    except Exception as exc:  # surface failure to the client
        db.update_job(job_id, "error", now_iso(), message=str(exc))


@app.on_event("startup")
def _startup():
    db.init_db()


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/feeds")
def feeds():
    return {"feeds": db.list_feeds()}


@app.get("/api/feeds/{feed_id}/history")
def feed_history(feed_id: str):
    return {"runs": db.list_runs(feed_id)}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str):
    job = db.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return job


@app.post("/api/reanalyze")
def reanalyze(feedId: Optional[str] = None):
    targets = [feedId] if feedId else list(KNOWN_CLIPS.keys())
    jobs = []
    for fid in targets:
        if fid not in KNOWN_CLIPS:
            raise HTTPException(status_code=400, detail=f"unknown clip {fid}")
        title, area, file, status, highlight = KNOWN_CLIPS[fid]
        if not (VIDEOS_DIR / file).exists():
            raise HTTPException(status_code=400, detail=f"missing video {file}")
        position = db.next_position() if not db.feed_exists(fid) else _position_of(fid)
        job_id = uuid.uuid4().hex
        db.create_job(job_id, "reanalyze", fid, now_iso())
        EXEC.submit(_run_job, job_id, fid, position, (title, area, file, status, highlight))
        jobs.append({"jobId": job_id, "feedId": fid})
    return {"jobs": jobs}


def _position_of(fid):
    for i, doc in enumerate(db.list_feeds()):
        if doc["id"] == fid:
            return doc.get("_position", i)
    return db.next_position()


@app.post("/api/upload")
async def upload(file: UploadFile = File(...),
                 title: Optional[str] = Form(default=None),
                 area: Optional[str] = Form(default=None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="no file")

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", file.filename)
    dest = VIDEOS_DIR / safe_name
    counter = 1
    while dest.exists():
        dest = VIDEOS_DIR / f"{Path(safe_name).stem}_{counter}{Path(safe_name).suffix}"
        counter += 1

    data = await file.read()
    dest.write_bytes(data)

    base_id = slugify(dest.name)
    feed_id = base_id
    n = 2
    while db.feed_exists(feed_id):
        feed_id = f"{base_id}-{n}"
        n += 1

    meta = (
        title or Path(file.filename).stem,
        area or "Uploaded",
        dest.name,
        "Review",
        "Uploaded clip",
    )
    position = db.next_position()
    job_id = uuid.uuid4().hex
    db.create_job(job_id, "upload", feed_id, now_iso())
    EXEC.submit(_run_job, job_id, feed_id, position, meta)
    return {"jobId": job_id, "feedId": feed_id}
