"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { GraphPanel } from "@/components/GraphPanel";
import { MetricCard } from "@/components/MetricCard";
import { SummaryPanels } from "@/components/SummaryPanels";
import { VideoCard } from "@/components/VideoCard";
import { VideoStage } from "@/components/VideoStage";
import { ViolationTable } from "@/components/ViolationTable";
import { cameraFeeds, metrics } from "@/data/traffic";

const tabs = ["Data View", "Graph", "Table"] as const;

type Tab = (typeof tabs)[number];

export function TrafficDashboard({
  onLogout,
  userEmail
}: {
  onLogout: () => void;
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Data View");
  const [selectedFeedId, setSelectedFeedId] = useState(cameraFeeds[0].id);

  const selectedFeed = useMemo(
    () => cameraFeeds.find((feed) => feed.id === selectedFeedId) ?? cameraFeeds[0],
    [selectedFeedId]
  );

  return (
    <main className="min-h-screen">
      <AppHeader onLogout={onLogout} userEmail={userEmail} />
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-md border border-slate-200 bg-[#eef5fc] p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                  Select Area
                  <select className="h-10 min-w-52 rounded-sm border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#3157a8]">
                    <option>Main Street</option>
                    <option>City Center</option>
                    <option>Market Road</option>
                    <option>Toll Junction</option>
                    <option>Ring Road</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                  Filter:
                  <span className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-sm font-bold text-slate-950">
                    Live <ChevronDown size={16} />
                  </span>
                </label>
              </div>
              <div className="inline-flex w-fit items-center rounded-md border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600">
                Live Metrics
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
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
                <div className="space-y-5">
                  <div className="metric-grid grid gap-4">
                    {metrics.map((metric) => (
                      <MetricCard key={metric.label} metric={metric} />
                    ))}
                  </div>
                  <VideoStage feed={selectedFeed} />
                  <section>
                    <h2 className="mb-3 text-lg font-semibold text-slate-950">Video Evidence</h2>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {cameraFeeds.map((feed) => (
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
                <SummaryPanels />
              </div>
            )}

            {activeTab === "Graph" && <GraphPanel />}

            {activeTab === "Table" && <ViolationTable />}
          </div>
        </section>
      </div>
    </main>
  );
}
