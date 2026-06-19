import { Download } from "lucide-react";
import type { CameraFeed } from "@/data/traffic";
import { tableRows } from "@/data/traffic";

const filters = [
  "All Violations",
  "Illegal Parking",
  "Lane Detection",
  "Stop/Yield Violation",
  "Undetected Infiltrations",
  "Speed Detection"
];

export function ViolationTable({ feed }: { feed: CameraFeed }) {
  const feedRows = tableRows.filter((row) => row.feedId === feed.id);

  return (
    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-1">
          {filters.map((filter, index) => (
            <button
              className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                index === 0 ? "bg-[#dfe9f5] text-[#214b9b]" : "text-slate-700 hover:bg-slate-100"
              }`}
              key={filter}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </aside>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#dfe9f5] px-4 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Violations</h2>
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
              Total: {feedRows.length}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-[#1688f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f72ce]"
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
                <th className="px-4 py-4 font-bold">Vehicle Type</th>
                <th className="px-4 py-4 font-bold">Violation Type</th>
                <th className="px-4 py-4 font-bold">Vehicle Speed</th>
                <th className="px-4 py-4 font-bold">Camera</th>
                <th className="px-4 py-4 font-bold">Time Stamp</th>
              </tr>
            </thead>
            <tbody>
              {feedRows.map((row) => (
                <tr className="border-b border-slate-100 text-sm text-slate-700" key={`${row.plate}-${row.timestamp}`}>
                  <td className="px-4 py-4 font-medium text-slate-950">{row.plate}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
