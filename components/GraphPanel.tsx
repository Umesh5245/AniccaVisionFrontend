import { Download } from "lucide-react";
import { vehicleChart, violationChart } from "@/data/traffic";

const vehicleLegend = [
  { key: "bicycle", label: "Bicycle", color: "bg-emerald-500" },
  { key: "motorcycle", label: "Motorcycle", color: "bg-indigo-400" },
  { key: "trucks", label: "Trucks", color: "bg-orange-500" },
  { key: "buses", label: "Buses", color: "bg-amber-300" }
] as const;

const violationLegend = [
  { key: "parking", label: "Illegal Parking", color: "bg-emerald-500" },
  { key: "wrongLane", label: "Wrong lane", color: "bg-orange-500" },
  { key: "stop", label: "Stop/Yield", color: "bg-indigo-400" },
  { key: "speed", label: "Speed", color: "bg-sky-800" },
  { key: "infiltration", label: "Infiltration", color: "bg-amber-300" }
] as const;

function Legend({
  items
}: {
  items: readonly { label: string; color: string; key: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700" key={item.key}>
          <span className={`h-3 w-6 rounded-sm ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function GraphPanel() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Vehicle Count</h2>
            <p className="mt-4 text-3xl font-bold text-slate-950">250</p>
          </div>
          <button
            aria-label="Download vehicle count"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"
            type="button"
          >
            <Download size={18} />
          </button>
        </div>
        <Legend items={vehicleLegend} />
        <div className="mt-8 flex h-56 items-end justify-between gap-4 border-b border-slate-200 px-2">
          {vehicleChart.map((group) => {
            const total = group.bicycle + group.motorcycle + group.trucks + group.buses;

            return (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-3" key={group.label}>
                <div className="flex h-44 w-full max-w-16 flex-col justify-end overflow-hidden rounded-t-sm">
                  {vehicleLegend.map((item) => (
                    <div
                      className={item.color}
                      key={item.key}
                      style={{ height: `${(group[item.key] / total) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600">{group.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Violations</h2>
            <p className="mt-4 text-3xl font-bold text-slate-950">85</p>
          </div>
          <button
            aria-label="Download violations"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"
            type="button"
          >
            <Download size={18} />
          </button>
        </div>
        <Legend items={violationLegend} />
        <div className="mt-8 flex h-56 items-end justify-between gap-4 border-b border-slate-200 px-2">
          {violationChart.map((group) => {
            const total =
              group.parking + group.wrongLane + group.stop + group.speed + group.infiltration;

            return (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-3" key={group.label}>
                <div className="flex h-44 w-full max-w-16 flex-col justify-end overflow-hidden rounded-t-sm">
                  {violationLegend.map((item) => (
                    <div
                      className={item.color}
                      key={item.key}
                      style={{ height: `${(group[item.key] / total) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600">{group.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
