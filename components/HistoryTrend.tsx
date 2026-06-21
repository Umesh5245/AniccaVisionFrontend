"use client";

import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHistory, type RunHistory } from "@/lib/api";

// Compact per-camera trend from the backend `runs` table. Renders nothing when
// there's no recorded history (e.g. backend offline / never re-analyzed).
export function HistoryTrend({ feedId }: { feedId: string }) {
  const [runs, setRuns] = useState<RunHistory[] | null>(null);

  useEffect(() => {
    let active = true;
    setRuns(null);
    fetchHistory(feedId)
      .then((r) => active && setRuns(r))
      .catch(() => active && setRuns([]));
    return () => {
      active = false;
    };
  }, [feedId]);

  if (!runs || runs.length === 0) {
    return null;
  }

  const series = [...runs].reverse(); // backend is newest-first → chronological
  const maxV = Math.max(...series.map((r) => r.vehicles), 1);
  const latest = runs[0];

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
          <History size={15} className="text-primary" />
          Analysis history
        </h3>
        <span className="text-xs font-medium text-slate-500">{series.length} runs</span>
      </div>
      <div className="flex h-20 items-end gap-1.5">
        {series.map((run, i) => (
          <div
            className="flex flex-1 flex-col items-center justify-end"
            key={run.analyzed_at + i}
            title={`${run.vehicles} vehicles · ${run.violations} violations · ${run.confidence}%`}
          >
            <div
              className="w-full rounded-t-sm bg-primary/70"
              style={{ height: `${Math.max(4, (run.vehicles / maxV) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">
        Latest: {latest.vehicles} vehicles · {latest.violations} violations · {latest.confidence}%
        confidence
      </p>
    </section>
  );
}
