"use client";

import { Cctv } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CameraSwitcher,
  EmptyState,
  GraphPanel,
  MetricCard,
  Skeleton,
  SummaryPanels,
  VideoStage,
  ViolationTable,
  type TableRow
} from "@anicca/ui";
import { AppHeader } from "@/components/AppHeader";
import { useDataset } from "@/components/DataContext";
import { HistoryTrend } from "@/components/HistoryTrend";
import { metricsForFeed } from "@/data/traffic";
import { posterSource, videoSource } from "@/lib/media";

const tabs = ["Data View", "Graph", "Violations"] as const;

type Tab = (typeof tabs)[number];

export function TrafficDashboard({
  onLogout,
  userEmail
}: {
  onLogout: () => void;
  userEmail: string;
}) {
  const { dataset, source } = useDataset();
  const feeds = dataset.feeds;
  const loading = source === "loading";

  const [activeTab, setActiveTab] = useState<Tab>("Data View");
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id ?? "");

  // Keep the selection valid as the dataset changes (static -> live, uploads).
  useEffect(() => {
    if (feeds.length > 0 && !feeds.some((feed) => feed.id === selectedFeedId)) {
      setSelectedFeedId(feeds[0].id);
    }
  }, [feeds, selectedFeedId]);

  const selectedFeed = feeds.find((feed) => feed.id === selectedFeedId) ?? feeds[0];
  const showTollPlateReads =
    selectedFeed?.id === "plate-capture" || selectedFeed?.area === "Toll Junction";

  const tollPlateRows = useMemo(() => {
    if (!selectedFeed) return [];

    return dataset.tableRows
      .filter((row) => row.feedId === selectedFeed.id && row.ocrConfidence > 0)
      .sort((a, b) => (Date.parse(a.timestamp) || 0) - (Date.parse(b.timestamp) || 0));
  }, [dataset.tableRows, selectedFeed]);

  // Enrich each metric with its % difference vs the fleet average (trend hint).
  const selectedMetrics = useMemo(() => {
    if (!selectedFeed) return [];
    const base = metricsForFeed(selectedFeed);
    const all = feeds.map(metricsForFeed);
    return base.map((metric, i) => {
      const values = all.map((m) => m[i]?.value ?? 0);
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const delta = avg > 0 ? Math.round(((metric.value - avg) / avg) * 100) : 0;
      return { ...metric, delta };
    });
  }, [selectedFeed, feeds]);

  if (!selectedFeed) {
    return (
      <main className="min-h-full">
        <AppHeader onLogout={onLogout} userEmail={userEmail} />
        <EmptyState
          className="mt-10"
          hint="Connect the analysis backend or check the data source."
          icon={Cctv}
          title="No camera feeds yet"
        />
      </main>
    );
  }

  return (
    <main className="min-h-full">
      <AppHeader onLogout={onLogout} userEmail={userEmail} />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Cameras</h2>
            </div>

            <CameraSwitcher
              feeds={feeds}
              onSelect={setSelectedFeedId}
              posterFor={(feed) => posterSource(feed.file)}
              selectedId={selectedFeedId}
            />

            <nav className="flex gap-5 border-b border-slate-300" aria-label="Dashboard sections">
              {tabs.map((tab) => (
                <button
                  className={`-mb-px border-b-2 px-1 pb-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    activeTab === tab
                      ? "border-primary-bright text-primary-bright"
                      : "border-transparent text-slate-600 hover:text-slate-950"
                  }`}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </nav>

            {activeTab === "Data View" && (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-slate-700">
                      <span className="font-bold uppercase tracking-wide text-slate-500">
                        Selected camera
                      </span>{" "}
                      · {selectedFeed.title}
                    </h3>
                    {!showTollPlateReads && (
                      <div className="metric-grid grid gap-4">
                        {loading
                          ? Array.from({ length: 4 }).map((_, i) => (
                              <Skeleton className="h-[104px]" key={i} />
                            ))
                          : selectedMetrics.map((metric) => (
                              <MetricCard key={metric.label} metric={metric} />
                            ))}
                      </div>
                    )}
                    <VideoStage
                      feed={selectedFeed}
                      key={selectedFeed.id}
                      posterSrc={posterSource(selectedFeed.file)}
                      videoSrc={videoSource(selectedFeed.file)}
                    />
                    <HistoryTrend feedId={selectedFeed.id} />
                  </div>
                  <div className="space-y-5">
                    {showTollPlateReads && <TollPlateReads rows={tollPlateRows} />}
                    <SummaryPanels feed={selectedFeed} hideViolations={showTollPlateReads} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Graph" && (
              <GraphPanel
                feed={selectedFeed}
                vehicleTimeline={dataset.vehicleTimelineByFeed[selectedFeed.id] ?? []}
                violationTimeline={dataset.violationTimelineByFeed[selectedFeed.id] ?? []}
              />
            )}

            {activeTab === "Violations" && (
              <ViolationTable
                feed={selectedFeed}
                rows={dataset.tableRows.filter((row) => row.feedId === selectedFeed.id)}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TollPlateReads({ rows }: { rows: TableRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-surface-muted px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Number Plates Read</h2>
          <p className="text-sm font-medium text-slate-500">Toll Junction ANPR reads</p>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
          {rows.length} reads
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm font-semibold text-slate-500">
            No readable plates for this toll run.
          </p>
        ) : (
          rows.map((row) => (
            <div className="px-4 py-3" key={`${row.plate}-${row.timestamp}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-950">{row.plate}</span>
                <span
                  className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    row.ocrConfidence >= 0.85
                      ? "bg-emerald-50 text-emerald-700"
                      : row.ocrConfidence >= 0.6
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {Math.round(row.ocrConfidence * 100)}%
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                <span>{row.vehicle}</span>
                <span>{row.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
