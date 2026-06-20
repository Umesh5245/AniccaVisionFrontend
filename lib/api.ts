import type {
  CameraFeed,
  TableRow,
  VehicleBucket,
  ViolationBucket
} from "@/data/traffic";

// A full analyzed feed as returned by the backend (a CameraFeed plus its
// timelines and plate reads).
export type FeedDoc = CameraFeed & {
  vehicleTimeline: VehicleBucket[];
  violationTimeline: ViolationBucket[];
  plates: TableRow[];
  analyzedAt?: string;
};

export type RunHistory = {
  vehicles: number;
  violations: number;
  confidence: number;
  analyzed_at: string;
};

export type Dataset = {
  feeds: CameraFeed[];
  vehicleTimelineByFeed: Record<string, VehicleBucket[]>;
  violationTimelineByFeed: Record<string, ViolationBucket[]>;
  tableRows: TableRow[];
  live: boolean;
};

export type Job = {
  id: string;
  kind: string;
  feed_id: string | null;
  status: "queued" | "running" | "done" | "error";
  message: string | null;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

export function datasetFromDocs(docs: FeedDoc[]): Dataset {
  return {
    feeds: docs,
    vehicleTimelineByFeed: Object.fromEntries(docs.map((d) => [d.id, d.vehicleTimeline])),
    violationTimelineByFeed: Object.fromEntries(docs.map((d) => [d.id, d.violationTimeline])),
    tableRows: docs.flatMap((d) => d.plates ?? []),
    live: true
  };
}

// Overlay live analyses onto the bundled static seed: every known camera stays
// visible, live data replaces its static counterpart, and uploaded feeds are
// appended. Avoids the dashboard going sparse when only some clips are analyzed.
export function mergeDatasets(base: Dataset, docs: FeedDoc[]): Dataset {
  const feedsById = new Map(base.feeds.map((f) => [f.id, f]));
  const vehicleTimelineByFeed = { ...base.vehicleTimelineByFeed };
  const violationTimelineByFeed = { ...base.violationTimelineByFeed };
  let tableRows = [...base.tableRows];

  for (const doc of docs) {
    feedsById.set(doc.id, doc);
    vehicleTimelineByFeed[doc.id] = doc.vehicleTimeline;
    violationTimelineByFeed[doc.id] = doc.violationTimeline;
    tableRows = tableRows.filter((r) => r.feedId !== doc.id).concat(doc.plates ?? []);
  }

  return {
    feeds: Array.from(feedsById.values()),
    vehicleTimelineByFeed,
    violationTimelineByFeed,
    tableRows,
    live: docs.length > 0
  };
}

export async function fetchFeeds(): Promise<FeedDoc[]> {
  const res = await fetch(`${API_BASE}/api/feeds`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`feeds request failed: ${res.status}`);
  }
  const data = (await res.json()) as { feeds: FeedDoc[] };
  return data.feeds;
}

export async function fetchHistory(feedId: string): Promise<RunHistory[]> {
  const res = await fetch(`${API_BASE}/api/feeds/${encodeURIComponent(feedId)}/history`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`history request failed: ${res.status}`);
  }
  const data = (await res.json()) as { runs: RunHistory[] };
  return data.runs;
}

export async function uploadVideo(
  file: File,
  meta: { title?: string; area?: string }
): Promise<{ jobId: string; feedId: string }> {
  const form = new FormData();
  form.append("file", file);
  if (meta.title) form.append("title", meta.title);
  if (meta.area) form.append("area", meta.area);
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`);
  }
  return res.json();
}

export async function reanalyze(feedId?: string): Promise<{ jobs: { jobId: string }[] }> {
  const url = feedId
    ? `${API_BASE}/api/reanalyze?feedId=${encodeURIComponent(feedId)}`
    : `${API_BASE}/api/reanalyze`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`reanalyze failed: ${res.status}`);
  }
  return res.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`job request failed: ${res.status}`);
  }
  return res.json();
}

// Poll a job until it leaves the queued/running state (or times out).
export async function waitForJob(
  jobId: string,
  onTick?: (job: Job) => void,
  { intervalMs = 2500, timeoutMs = 600000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<Job> {
  const start = Date.now();
  for (;;) {
    const job = await getJob(jobId);
    onTick?.(job);
    if (job.status === "done" || job.status === "error") {
      return job;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("job timed out");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
