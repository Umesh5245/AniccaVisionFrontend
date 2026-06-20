"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { useDataset } from "@/components/DataContext";
import type { CameraFeed } from "@/data/traffic";
import { downloadCsv } from "@/lib/csv";

const csvColumns = [
  { key: "plate", label: "Vehicle Number" },
  { key: "ocrConfidence", label: "OCR Confidence" },
  { key: "vehicle", label: "Vehicle Type" },
  { key: "violation", label: "Violation Type" },
  { key: "speed", label: "Vehicle Speed" },
  { key: "camera", label: "Camera" },
  { key: "timestamp", label: "Time Stamp" }
];

// label shown in the sidebar -> keyword matched (case-insensitive) against a
// row's violation type. "All Violations" matches everything.
const filters = [
  { label: "All", match: null },
  { label: "Illegal Parking", match: "parking" },
  { label: "Lane Detection", match: "lane" },
  { label: "Stop/Yield Violation", match: "stop" },
  { label: "Undetected Infiltrations", match: "infiltration" },
  { label: "Speed Detection", match: "speed" }
] as const;

export function ViolationTable({ feed }: { feed: CameraFeed }) {
  const { dataset } = useDataset();
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const match = filters.find((filter) => filter.label === activeFilter)?.match ?? null;
  const feedRows = dataset.tableRows
    .filter((row) => row.feedId === feed.id)
    .filter((row) => (match ? row.violation.toLowerCase().includes(match) : true));

  return (
    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-1">
          {filters.map((filter) => (
            <button
              className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                filter.label === activeFilter
                  ? "bg-[#dfe9f5] text-[#214b9b]"
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
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#dfe9f5] px-4 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">ANPR Detections</h2>
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
              Total: {feedRows.length}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-[#1688f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f72ce] disabled:opacity-50"
            disabled={feedRows.length === 0}
            onClick={() => downloadCsv(`${feed.id}-plates.csv`, csvColumns, feedRows)}
            type="button"
          >
            <Download size={16} />
            Download
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-sm text-slate-950">
                <th className="px-4 py-4 font-bold">Vehicle Number</th>
                <th className="px-4 py-4 font-bold">OCR Conf.</th>
                <th className="px-4 py-4 font-bold">Vehicle Type</th>
                <th className="px-4 py-4 font-bold">Violation Type</th>
                <th className="px-4 py-4 font-bold">Vehicle Speed</th>
                <th className="px-4 py-4 font-bold">Camera</th>
                <th className="px-4 py-4 font-bold">Time Stamp</th>
              </tr>
            </thead>
            <tbody>
              {feedRows.length === 0 && (
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <td className="px-4 py-6 text-center" colSpan={7}>
                    No matching plate detections for this camera.
                  </td>
                </tr>
              )}
              {feedRows.map((row) => {
                const isViolation = row.violation !== "No violation";

                return (
                <tr className="border-b border-slate-100 text-sm text-slate-700" key={`${row.plate}-${row.timestamp}`}>
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
                  <td className="px-4 py-4">{row.violation}</td>
                  <td className="px-4 py-4">
                    <span className={row.speed.startsWith("75") ? "font-bold text-rose-500" : ""}>
                      {row.speed}
                    </span>
                  </td>
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
