"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useDataset } from "@/components/DataContext";
import { GraphPanel } from "@/components/GraphPanel";
import { MetricCard } from "@/components/MetricCard";
import { SummaryPanels } from "@/components/SummaryPanels";
import { VideoCard } from "@/components/VideoCard";
import { VideoStage } from "@/components/VideoStage";
import { ViolationTable } from "@/components/ViolationTable";
import { metricsForFeed } from "@/data/traffic";

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
  const { dataset } = useDataset();
  const feeds = dataset.feeds;

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
  const selectedMetrics = useMemo(
    () => (selectedFeed ? metricsForFeed(selectedFeed) : []),
    [selectedFeed]
  );

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
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600">No camera feeds yet.</div>
      </main>
    );
  }

  return (
    <main className="min-h-full">
      <AppHeader onLogout={onLogout} userEmail={userEmail} />
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-md border border-slate-200 bg-[#eef5fc] p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                  Select Area
                  <select
                    className="h-10 min-w-52 rounded-sm border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#3157a8]"
                    onChange={(event) => setSelectedFeedId(event.target.value)}
                    value={selectedFeedId}
                  >
                    {visibleFeeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.area}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                  Filter:
                  <select
                    className="h-10 min-w-32 rounded-sm border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#3157a8]"
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
            </div>

            <nav className="flex gap-5 border-b border-slate-300" aria-label="Dashboard sections">
              {tabs.map((tab) => (
                <button
                  className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${
                    activeTab === tab
                      ? "border-[#1c55c5] text-[#1c55c5]"
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
                    <div className="metric-grid grid gap-4">
                      {selectedMetrics.map((metric) => (
                        <MetricCard key={metric.label} metric={metric} />
                      ))}
                    </div>
                    <VideoStage feed={selectedFeed} />
                  </div>
                  <SummaryPanels feed={selectedFeed} />
                </div>
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-slate-950">Video Evidence</h2>
                  <div className="grid auto-rows-fr grid-cols-5 gap-4">
                    {visibleFeeds.map((feed) => (
                      <VideoCard
                        feed={feed}
                        key={feed.id}
                        onSelect={() => setSelectedFeedId(feed.id)}
                        selected={feed.id === selectedFeed.id}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "Graph" && <GraphPanel feed={selectedFeed} />}

            {activeTab === "Violations" && <ViolationTable feed={selectedFeed} />}
          </div>
        </section>
      </div>
    </main>
  );
}
