"use client";

import { Cctv } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CameraSwitcher,
  EmptyState,
  GraphPanel,
  KpiStrip,
  KpiStripSkeleton,
  MetricCard,
  Skeleton,
  SummaryPanels,
  VideoCard,
  VideoStage,
  ViolationTable
} from "@anicca/ui";
import { AppHeader } from "@/components/AppHeader";
import { useDataset } from "@/components/DataContext";
import { HistoryTrend } from "@/components/HistoryTrend";
import { metricsForFeed } from "@/data/traffic";
import { posterSource, videoSource } from "@/lib/media";

const tabs = ["Data View", "Graph", "Violations"] as const;

type Tab = (typeof tabs)[number];

const statusFilters = ["All", "Live", "Review"] as const;

type StatusFilter = (typeof statusFilters)[number];

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id ?? "");

  // Keep the selection valid as the dataset changes (static -> live, uploads).
  useEffect(() => {
    if (feeds.length > 0 && !feeds.some((feed) => feed.id === selectedFeedId)) {
      setSelectedFeedId(feeds[0].id);
    }
  }, [feeds, selectedFeedId]);

  const visibleFeeds = useMemo(
    () =>
      statusFilter === "All" ? feeds : feeds.filter((feed) => feed.status === statusFilter),
    [feeds, statusFilter]
  );

  const selectedFeed = feeds.find((feed) => feed.id === selectedFeedId) ?? feeds[0];

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

  function handleStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    const next = value === "All" ? feeds : feeds.filter((feed) => feed.status === value);
    if (next.length > 0 && !next.some((feed) => feed.id === selectedFeedId)) {
      setSelectedFeedId(next[0].id);
    }
  }

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
        {loading ? <KpiStripSkeleton /> : <KpiStrip feeds={feeds} />}

        <section className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Cameras</h2>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                Filter
                <select
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                  onChange={(event) => handleStatusFilter(event.target.value as StatusFilter)}
                  value={statusFilter}
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All cameras" : status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <CameraSwitcher
              feeds={visibleFeeds}
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
                    <div className="metric-grid grid gap-4">
                      {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton className="h-[104px]" key={i} />
                          ))
                        : selectedMetrics.map((metric) => (
                            <MetricCard key={metric.label} metric={metric} />
                          ))}
                    </div>
                    <VideoStage
                      feed={selectedFeed}
                      key={selectedFeed.id}
                      posterSrc={posterSource(selectedFeed.file)}
                      videoSrc={videoSource(selectedFeed.file)}
                    />
                    <HistoryTrend feedId={selectedFeed.id} />
                  </div>
                  <SummaryPanels feed={selectedFeed} />
                </div>
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-slate-950">Video Evidence</h2>
                  <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {visibleFeeds.map((feed) => (
                      <VideoCard
                        feed={feed}
                        key={feed.id}
                        onSelect={() => setSelectedFeedId(feed.id)}
                        posterSrc={posterSource(feed.file)}
                        selected={feed.id === selectedFeed.id}
                        videoSrc={videoSource(feed.file)}
                      />
                    ))}
                  </div>
                </section>
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
