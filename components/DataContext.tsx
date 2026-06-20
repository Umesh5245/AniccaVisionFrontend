"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import {
  cameraFeeds,
  tableRows,
  vehicleTimelineByFeed,
  violationTimelineByFeed
} from "@/data/traffic";
import {
  fetchFeeds,
  getJob,
  mergeDatasets,
  reanalyze,
  uploadVideo,
  waitForJob,
  type Dataset,
  type Job
} from "@/lib/api";

const staticDataset: Dataset = {
  feeds: cameraFeeds,
  vehicleTimelineByFeed,
  violationTimelineByFeed,
  tableRows,
  live: false
};

type Source = "loading" | "live" | "static";
type JobUi = { active: boolean; status: Job["status"] | "idle"; label: string };

const idle: JobUi = { active: false, status: "idle", label: "" };

type DataContextValue = {
  dataset: Dataset;
  source: Source;
  job: JobUi;
  refresh: () => Promise<void>;
  upload: (file: File, meta: { title?: string; area?: string }) => Promise<void>;
  reanalyzeAll: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset>(staticDataset);
  const [source, setSource] = useState<Source>("loading");
  const [job, setJob] = useState<JobUi>(idle);

  const refresh = useCallback(async () => {
    try {
      const docs = await fetchFeeds();
      if (docs.length > 0) {
        // overlay live analyses on the static seed so every camera stays visible
        setDataset(mergeDatasets(staticDataset, docs));
        setSource("live");
        return;
      }
    } catch {
      // backend unreachable — fall through to the bundled static data
    }
    setDataset(staticDataset);
    setSource("static");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trackJob = useCallback(
    async (jobId: string) => {
      const final = await waitForJob(jobId, (j) =>
        setJob({
          active: true,
          status: j.status,
          label: j.status === "running" ? "Analyzing video…" : "Queued…"
        })
      );
      if (final.status === "done") {
        setJob({ active: true, status: "done", label: "Analysis complete" });
        await refresh();
      } else {
        setJob({ active: true, status: "error", label: final.message || "Analysis failed" });
      }
      setTimeout(() => setJob(idle), 4000);
    },
    [refresh]
  );

  const upload = useCallback(
    async (file: File, meta: { title?: string; area?: string }) => {
      setJob({ active: true, status: "queued", label: "Uploading…" });
      try {
        const { jobId } = await uploadVideo(file, meta);
        await trackJob(jobId);
      } catch (err) {
        setJob({ active: true, status: "error", label: (err as Error).message });
        setTimeout(() => setJob(idle), 4000);
      }
    },
    [trackJob]
  );

  const reanalyzeAll = useCallback(async () => {
    setJob({ active: true, status: "queued", label: "Queued re-analysis…" });
    try {
      const { jobs } = await reanalyze();
      for (const j of jobs) {
        // jobs run serially on the backend; poll each in turn
        // eslint-disable-next-line no-await-in-loop
        await waitForJob(j.jobId, (job) =>
          setJob({
            active: true,
            status: job.status,
            label: job.status === "running" ? "Analyzing clips…" : "Queued…"
          })
        ).then(() => getJob(j.jobId));
        // eslint-disable-next-line no-await-in-loop
        await refresh();
      }
      setJob({ active: true, status: "done", label: "Re-analysis complete" });
    } catch (err) {
      setJob({ active: true, status: "error", label: (err as Error).message });
    }
    setTimeout(() => setJob(idle), 4000);
  }, [refresh]);

  return (
    <DataContext.Provider value={{ dataset, source, job, refresh, upload, reanalyzeAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useDataset must be used within DataProvider");
  }
  return ctx;
}
