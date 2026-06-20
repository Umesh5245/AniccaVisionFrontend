"""SQLite persistence for analyzed feeds, analysis jobs, and run history."""
import json
import os
import sqlite3
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.environ.get("ANICCA_DB_PATH", Path(__file__).resolve().parent / "anicca.db"))

_conn = sqlite3.connect(DB_PATH, check_same_thread=False)
_conn.row_factory = sqlite3.Row
_lock = threading.Lock()


def init_db():
    with _lock:
        _conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS feeds (
                id TEXT PRIMARY KEY,
                doc TEXT NOT NULL,
                position INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                kind TEXT NOT NULL,
                feed_id TEXT,
                status TEXT NOT NULL,
                message TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feed_id TEXT NOT NULL,
                vehicles INTEGER NOT NULL,
                violations INTEGER NOT NULL,
                confidence INTEGER NOT NULL,
                analyzed_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_runs_feed ON runs(feed_id);
            """
        )
        _conn.commit()


def upsert_feed(doc, position, now):
    with _lock:
        _conn.execute(
            """INSERT INTO feeds (id, doc, position, updated_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET doc=excluded.doc, updated_at=excluded.updated_at""",
            (doc["id"], json.dumps(doc), position, now),
        )
        _conn.commit()


def list_feeds():
    with _lock:
        rows = _conn.execute("SELECT doc FROM feeds ORDER BY position ASC, updated_at ASC").fetchall()
    return [json.loads(r["doc"]) for r in rows]


def feed_exists(feed_id):
    with _lock:
        row = _conn.execute("SELECT 1 FROM feeds WHERE id=?", (feed_id,)).fetchone()
    return row is not None


def next_position():
    with _lock:
        row = _conn.execute("SELECT COALESCE(MAX(position), -1) + 1 AS n FROM feeds").fetchone()
    return row["n"]


def create_job(job_id, kind, feed_id, now):
    with _lock:
        _conn.execute(
            "INSERT INTO jobs (id, kind, feed_id, status, message, created_at, updated_at) "
            "VALUES (?, ?, ?, 'queued', NULL, ?, ?)",
            (job_id, kind, feed_id, now, now),
        )
        _conn.commit()


def update_job(job_id, status, now, message=None):
    with _lock:
        _conn.execute(
            "UPDATE jobs SET status=?, message=?, updated_at=? WHERE id=?",
            (status, message, now, job_id),
        )
        _conn.commit()


def get_job(job_id):
    with _lock:
        row = _conn.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
    return dict(row) if row else None


def insert_run(feed_id, vehicles, violations, confidence, now):
    with _lock:
        _conn.execute(
            "INSERT INTO runs (feed_id, vehicles, violations, confidence, analyzed_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (feed_id, vehicles, violations, confidence, now),
        )
        _conn.commit()


def list_runs(feed_id, limit=50):
    with _lock:
        rows = _conn.execute(
            "SELECT vehicles, violations, confidence, analyzed_at FROM runs "
            "WHERE feed_id=? ORDER BY id DESC LIMIT ?",
            (feed_id, limit),
        ).fetchall()
    return [dict(r) for r in rows]
