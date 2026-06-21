"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp, Download, FileSearch, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadCsv } from "./csv";
import { EmptyState } from "./EmptyState";
import type { CameraFeed, TableRow } from "./types";

const csvColumns = [
  { key: "plate", label: "Vehicle Number" },
  { key: "ocrConfidence", label: "OCR Confidence" },
  { key: "vehicle", label: "Vehicle Type" },
  { key: "violation", label: "Violation Type" },
  { key: "speed", label: "Vehicle Speed" },
  { key: "camera", label: "Camera" },
  { key: "timestamp", label: "Time Stamp" }
];

const filters = [
  { label: "All", match: null },
  { label: "Illegal Parking", match: "parking" },
  { label: "Lane Detection", match: "lane" },
  { label: "Stop/Yield Violation", match: "stop" },
  { label: "Undetected Infiltrations", match: "infiltration" },
  { label: "Speed Detection", match: "speed" }
] as const;

type SortKey = "plate" | "ocrConfidence" | "vehicle" | "violation" | "timestamp";

const columns: { key: keyof TableRow; label: string; sortKey?: SortKey }[] = [
  { key: "plate", label: "Vehicle Number", sortKey: "plate" },
  { key: "ocrConfidence", label: "OCR Conf.", sortKey: "ocrConfidence" },
  { key: "vehicle", label: "Vehicle Type", sortKey: "vehicle" },
  { key: "violation", label: "Violation Type", sortKey: "violation" },
  { key: "speed", label: "Vehicle Speed" },
  { key: "camera", label: "Camera" },
  { key: "timestamp", label: "Time Stamp", sortKey: "timestamp" }
];

export function ViolationTable({ feed, rows }: { feed: CameraFeed; rows: TableRow[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "ocrConfidence",
    dir: "desc"
  });

  const match = filters.find((filter) => filter.label === activeFilter)?.match ?? null;

  const feedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows
      .filter((row) => (match ? row.violation.toLowerCase().includes(match) : true))
      .filter(
        (row) => !q || row.plate.toLowerCase().includes(q) || row.vehicle.toLowerCase().includes(q)
      );

    return [...filtered].sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sort.key === "ocrConfidence") {
        av = a.ocrConfidence;
        bv = b.ocrConfidence;
      } else if (sort.key === "timestamp") {
        av = Date.parse(a.timestamp) || 0;
        bv = Date.parse(b.timestamp) || 0;
      } else {
        av = a[sort.key].toLowerCase();
        bv = b[sort.key].toLowerCase();
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, match, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-1">
          {filters.map((filter) => (
            <button
              className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                filter.label === activeFilter
                  ? "bg-surface-muted text-primary-deep"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">ANPR Detections</h2>
            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
              {feedRows.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search plates</span>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                className="h-9 w-44 rounded-md border border-slate-300 bg-white pl-8 pr-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plate…"
                type="search"
                value={query}
              />
            </label>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-info px-4 py-2 text-sm font-bold text-white transition hover:bg-info-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40 disabled:opacity-50"
              disabled={feedRows.length === 0}
              onClick={() => downloadCsv(`${feed.id}-plates.csv`, csvColumns, feedRows)}
              type="button"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-sm text-slate-950">
                {columns.map((col) => {
                  const active = col.sortKey && sort.key === col.sortKey;
                  return (
                    <th className="px-4 py-3 font-bold" key={col.key}>
                      {col.sortKey ? (
                        <button
                          className="inline-flex items-center gap-1 rounded transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          onClick={() => toggleSort(col.sortKey as SortKey)}
                          type="button"
                        >
                          {col.label}
                          {active ? (
                            sort.dir === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronsUpDown className="text-slate-300" size={14} />
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {feedRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      hint="Try a different camera, filter, or search term."
                      icon={FileSearch}
                      title="No matching plate detections"
                    />
                  </td>
                </tr>
              )}
              {feedRows.map((row) => {
                const isViolation = row.violation !== "No violation";

                return (
                  <tr
                    className={`border-b border-slate-100 text-sm text-slate-700 ${
                      isViolation ? "bg-rose-50/40" : ""
                    }`}
                    key={`${row.plate}-${row.timestamp}`}
                  >
                    <td
                      className={`px-4 py-4 font-bold ${
                        isViolation ? "text-rose-600" : "text-slate-950"
                      }`}
                    >
                      {row.plate}
                    </td>
                    <td className="px-4 py-4">
                      {row.ocrConfidence > 0 ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                            row.ocrConfidence >= 0.85
                              ? "bg-emerald-50 text-emerald-700"
                              : row.ocrConfidence >= 0.6
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {Math.round(row.ocrConfidence * 100)}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{row.vehicle}</td>
                    <td className="px-4 py-4">
                      {isViolation ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          {row.violation}
                        </span>
                      ) : (
                        <span className="text-slate-500">{row.violation}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{row.speed}</td>
                    <td className="px-4 py-4">{row.camera}</td>
                    <td className="px-4 py-4">{row.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
