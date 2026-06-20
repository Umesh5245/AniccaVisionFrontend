"""Fast smoke tests — no model loading, isolated temp DB."""
import os
import tempfile

os.environ["ANICCA_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test.db")

from backend import db  # noqa: E402
from backend.detection import _plate_candidate, _dedup_plates  # noqa: E402


def test_plate_candidate_accepts_mixed_alnum():
    assert _plate_candidate("AK396Y") == "AK396Y"
    assert _plate_candidate("ak 396 y") == "AK396Y"


def test_plate_candidate_rejects_junk():
    assert _plate_candidate("HELLO") is None      # letters only
    assert _plate_candidate("12345") is None       # digits only
    assert _plate_candidate("52C08MPH") is None     # speed overlay
    assert _plate_candidate("AB") is None           # too short


def test_dedup_collapses_similar_reads():
    rows = [
        {"plate": "593YB", "ocrConfidence": 0.99},
        {"plate": "A593YB", "ocrConfidence": 0.87},  # substring -> dup
        {"plate": "593YE", "ocrConfidence": 0.70},   # edit distance 1 -> dup
        {"plate": "AK396Y", "ocrConfidence": 0.96},  # distinct
    ]
    kept = _dedup_plates(rows)
    plates = sorted(r["plate"] for r in kept)
    assert plates == ["593YB", "AK396Y"]


def test_db_roundtrip_and_history():
    db.init_db()
    doc = {"id": "cam-1", "title": "Cam 1", "vehicles": 10, "violations": 2, "confidence": 80}
    db.upsert_feed(doc, 0, "2026-06-21T00:00:00Z")
    feeds = db.list_feeds()
    assert len(feeds) == 1 and feeds[0]["id"] == "cam-1"

    db.insert_run("cam-1", 10, 2, 80, "2026-06-21T00:00:00Z")
    db.insert_run("cam-1", 14, 3, 82, "2026-06-21T01:00:00Z")
    runs = db.list_runs("cam-1")
    assert len(runs) == 2
    assert runs[0]["vehicles"] == 14  # newest first
