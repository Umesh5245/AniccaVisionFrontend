"""Detection core: analyze ONE video into the full feed document the
dashboard consumes (headline counts, per-camera timelines, ANPR plate reads).

Mirrors the offline pipeline used to seed data/traffic.ts: YOLOv8s + ByteTrack
for counts/timelines, trajectory heuristics for violations, and EasyOCR on
tracked vehicles for plates. Models are loaded once and cached.
"""
import math
import re
import datetime
from collections import defaultdict

import cv2
import torch

torch.set_num_threads(max(1, (torch.get_num_threads() or 4)))

PERSON = 0
VEHICLE_CLASSES = {1: "bicycle", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
VEHICLE_LABEL = {1: "Bicycle", 2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}
HEAVY = {5, 7}
STRIDE = 2
N_BUCKETS = 8
MIN_AREA_FRAC = 0.004
MIN_PLATE_CONF = 0.5
MAX_OCR_PER_VIDEO = 700
OCR_MIN_WIDTH = 600  # skip plate OCR on low-res clips where plates are unreadable
ALLOW = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
BASE_TIME = datetime.datetime(2026, 6, 20, 9, 0, 0)

_model = None
_reader = None


def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO("yolov8s.pt")
    return _model


def _get_reader():
    global _reader
    if _reader is None:
        import easyocr
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


def _angle_diff(a, b):
    d = abs(a - b) % (2 * math.pi)
    return d if d <= math.pi else 2 * math.pi - d


def _mmss(seconds):
    m = int(seconds // 60)
    s = int(round(seconds - m * 60))
    if s == 60:
        m += 1
        s = 0
    return f"{m}:{s:02d}"


def _plate_candidate(text):
    s = re.sub(r"[^A-Z0-9]", "", text.upper())
    if not (5 <= len(s) <= 8):
        return None
    if "MPH" in s:  # on-screen speed overlay, not a plate
        return None
    if not re.search(r"[A-Z]", s) or not re.search(r"[0-9]", s):
        return None
    return s


def _levenshtein(a, b):
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def _similar(a, b):
    """Two plate reads are the same physical plate if one contains the other
    or they are within a small edit distance (handles OCR noise like
    593YB / A593YB / 593YE)."""
    if a in b or b in a:
        return True
    if abs(len(a) - len(b)) > 2:
        return False
    return _levenshtein(a, b) <= 2


def _dedup_plates(rows):
    rows = sorted(rows, key=lambda r: -r["ocrConfidence"])
    kept = []
    for r in rows:
        if any(_similar(r["plate"], k["plate"]) for k in kept):
            continue
        kept.append(r)
    return kept


def _probe(path):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    nframes = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    cap.release()
    return fps, nframes, w


def analyze_video(feed_id, path, *, title, area, file, fmt="mp4",
                  status="Review", highlight="Uploaded clip"):
    fps, nframes, width = _probe(path)
    dt = STRIDE / fps
    duration = (nframes / fps) if fps else 0
    bucket_len = (duration / N_BUCKETS) if duration else 1
    do_ocr = width >= OCR_MIN_WIDTH

    model = _get_model()
    reader = _get_reader() if do_ocr else None

    veh_pts = defaultdict(list)
    veh_cls = {}
    veh_entry = {}
    ped_pts = defaultdict(list)
    ped_entry = {}
    best_plate = {}  # tid -> (conf, plate)
    conf_sum = 0.0
    conf_n = 0
    diag = None
    frame_area = None
    sample = 0
    ocr_calls = 0

    for r in model.track(source=path, stream=True, persist=True, vid_stride=STRIDE,
                         classes=[PERSON, 1, 2, 3, 5, 7], conf=0.35, iou=0.5,
                         tracker="bytetrack.yaml", verbose=False):
        t = sample * dt
        sample += 1
        if r.boxes is None or r.boxes.id is None:
            continue
        if diag is None:
            H, W = r.orig_shape
            diag = math.hypot(W, H)
            frame_area = float(W * H)
        img = r.orig_img
        H, W = r.orig_shape
        for tid, c, cf, box in zip(r.boxes.id.int().tolist(), r.boxes.cls.int().tolist(),
                                   r.boxes.conf.tolist(), r.boxes.xywh.tolist()):
            cx, cy, bw, bh = box
            if c == PERSON:
                ped_pts[tid].append((cx, cy))
                ped_entry.setdefault(tid, t)
                continue
            if c not in VEHICLE_CLASSES:
                continue
            veh_pts[tid].append((cx, cy))
            veh_cls[tid] = c
            veh_entry.setdefault(tid, t)
            conf_sum += cf
            conf_n += 1
            if (do_ocr and (bw * bh) / frame_area >= MIN_AREA_FRAC
                    and best_plate.get(tid, (0, None))[0] < 0.6
                    and ocr_calls < MAX_OCR_PER_VIDEO):
                x1 = max(0, int(cx - bw / 2)); y1 = max(0, int(cy - bh / 2))
                x2 = min(W, int(cx + bw / 2)); y2 = min(H, int(cy + bh / 2))
                crop = img[y1:y2, x1:x2]
                if crop.size:
                    ocr_calls += 1
                    for _, text, oc in reader.readtext(crop, allowlist=ALLOW, paragraph=False):
                        cand = _plate_candidate(text)
                        if cand and oc >= MIN_PLATE_CONF and oc > best_plate.get(tid, (0, None))[0]:
                            best_plate[tid] = (oc, cand)

    def metrics(pts):
        if len(pts) < 2:
            return dict(net=0.0, dur=0.0, avg=0.0, mn=0.0, dx=0.0, dy=0.0, moved=False)
        seg = [(math.hypot(x1 - x0, y1 - y0) / diag) / dt
               for (x0, y0), (x1, y1) in zip(pts, pts[1:])]
        net = math.hypot(pts[-1][0] - pts[0][0], pts[-1][1] - pts[0][1]) / diag
        ang = math.atan2(pts[-1][1] - pts[0][1], pts[-1][0] - pts[0][0])
        return dict(net=net, dur=(len(pts) - 1) * dt, avg=sum(seg) / len(seg),
                    mn=min(seg), dx=math.cos(ang), dy=math.sin(ang), moved=net > 0.10)

    vm = {tid: metrics(p) for tid, p in veh_pts.items()}
    sx = sum(m["dx"] for m in vm.values() if m["moved"])
    sy = sum(m["dy"] for m in vm.values() if m["moved"])
    dom = math.atan2(sy, sx) if (sx or sy) else 0.0

    def bucket_of(tt):
        return min(N_BUCKETS - 1, int(tt // bucket_len)) if bucket_len > 0 else 0

    veh_buckets = [defaultdict(int) for _ in range(N_BUCKETS)]
    vio_buckets = [defaultdict(int) for _ in range(N_BUCKETS)]
    class_counts = {VEHICLE_CLASSES[c]: 0 for c in VEHICLE_CLASSES}
    parking = speed = wrong = noyield = infil = 0

    def violation_label(m):
        if m["dur"] >= 3.0 and m["net"] < 0.05:
            return "Illegal parking"
        if not m["moved"]:
            return "No violation"
        ang = math.atan2(m["dy"], m["dx"])
        if m["avg"] > 0.20:
            return "Speed detection"
        if _angle_diff(ang, dom) > math.radians(110):
            return "Wrong lane"
        if m["mn"] > 0.08:
            return "Stop/Yield violation"
        return "No violation"

    for tid, m in vm.items():
        cname = VEHICLE_CLASSES[veh_cls[tid]]
        class_counts[cname] += 1
        b = bucket_of(veh_entry[tid])
        veh_buckets[b][cname] += 1
        if m["dur"] >= 3.0 and m["net"] < 0.05:
            parking += 1; vio_buckets[b]["parking"] += 1; continue
        if not m["moved"]:
            continue
        ang = math.atan2(m["dy"], m["dx"])
        is_wrong = _angle_diff(ang, dom) > math.radians(110)
        is_speed = m["avg"] > 0.20
        if is_wrong:
            wrong += 1; vio_buckets[b]["wrongLane"] += 1
        if is_speed:
            speed += 1; vio_buckets[b]["speed"] += 1
        if m["mn"] > 0.08 and not is_speed:
            noyield += 1; vio_buckets[b]["stop"] += 1
    for tid, pts in ped_pts.items():
        if metrics(pts)["moved"]:
            infil += 1; vio_buckets[bucket_of(ped_entry[tid])]["infiltration"] += 1

    labels = [_mmss(i * bucket_len) for i in range(N_BUCKETS)]
    vehicle_timeline = [
        dict(label=labels[i], car=veh_buckets[i]["car"], motorcycle=veh_buckets[i]["motorcycle"],
             truck=veh_buckets[i]["truck"], bus=veh_buckets[i]["bus"], bicycle=veh_buckets[i]["bicycle"])
        for i in range(N_BUCKETS)
    ]
    violation_timeline = [
        dict(label=labels[i], parking=vio_buckets[i]["parking"], wrongLane=vio_buckets[i]["wrongLane"],
             stop=vio_buckets[i]["stop"], speed=vio_buckets[i]["speed"], infiltration=vio_buckets[i]["infiltration"])
        for i in range(N_BUCKETS)
    ]

    # Report a row for any vehicle that either has a readable plate or triggered
    # a real violation; unread plates on violators are flagged, not fabricated.
    plates = []
    for tid, m in vm.items():
        oc, plate = best_plate.get(tid, (0.0, None))
        viol = violation_label(m)
        if plate is None and viol == "No violation":
            continue
        ts = BASE_TIME + datetime.timedelta(seconds=veh_entry[tid])
        plates.append(dict(
            feedId=feed_id, plate=plate or "Not legible", vehicle=VEHICLE_LABEL[veh_cls[tid]],
            violation=viol, speed="--", camera=title,
            timestamp=ts.strftime("%m/%d/%Y %I:%M:%S %p"), ocrConfidence=round(oc, 2),
        ))
    # dedup only real plate reads; keep every flagged "Not legible" violation row
    readable = _dedup_plates([p for p in plates if p["ocrConfidence"] > 0])
    plates = readable + [p for p in plates if p["ocrConfidence"] == 0]

    violations_total = parking + speed + noyield + infil  # excludes wrongLane (own metric)

    return {
        "id": feed_id,
        "title": title,
        "area": area,
        "file": file,
        "format": fmt,
        "status": status,
        "vehicles": sum(class_counts.values()),
        "violations": violations_total,
        "confidence": round(100 * conf_sum / conf_n) if conf_n else 0,
        "highlight": highlight,
        "analysis": {
            "pedestrianLaneCrossings": len(ped_pts),
            "heavyMotorVehicles": sum(1 for c in veh_cls.values() if c in HEAVY),
            "wrongLaneVehicles": wrong,
            "vehicleClassifications": [
                {"label": "Cars", "value": class_counts["car"]},
                {"label": "Motorcycles", "value": class_counts["motorcycle"]},
                {"label": "Trucks", "value": class_counts["truck"]},
                {"label": "Buses", "value": class_counts["bus"]},
                {"label": "Bicycles", "value": class_counts["bicycle"]},
            ],
            "violationSummary": [
                {"label": "Undetected Infiltrations", "value": infil},
                {"label": "Speed Detection", "value": speed},
                {"label": "Illegal Parking", "value": parking},
                {"label": "Stop/Yield Violations", "value": noyield},
            ],
        },
        "vehicleTimeline": vehicle_timeline,
        "violationTimeline": violation_timeline,
        "plates": plates,
    }
