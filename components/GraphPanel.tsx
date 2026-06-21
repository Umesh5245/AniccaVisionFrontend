"use client";

import { BarChart3, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useDataset } from "@/components/DataContext";
import { EmptyState } from "@/components/EmptyState";
import type { CameraFeed } from "@/data/traffic";
import { downloadCsv } from "@/lib/csv";

const vehicleColumns = [
  { key: "label", label: "Time" },
  { key: "car", label: "Cars" },
  { key: "motorcycle", label: "Motorcycles" },
  { key: "truck", label: "Trucks" },
  { key: "bus", label: "Buses" },
  { key: "bicycle", label: "Bicycles" }
];

const violationColumns = [
  { key: "label", label: "Time" },
  { key: "parking", label: "Illegal Parking" },
  { key: "wrongLane", label: "Wrong Lane" },
  { key: "stop", label: "Stop/Yield" },
  { key: "speed", label: "Speed" },
  { key: "infiltration", label: "Infiltration" }
];

const vehicleSeries = [
  { key: "car", label: "Car", color: "#3157a8" },
  { key: "motorcycle", label: "Motorcycle", color: "#818cf8" },
  { key: "truck", label: "Trucks", color: "#f97316" },
  { key: "bus", label: "Buses", color: "#fcd34d" },
  { key: "bicycle", label: "Bicycle", color: "#10b981" }
] as const;

const violationSeries = [
  { key: "parking", label: "Illegal Parking", color: "#10b981" },
  { key: "wrongLane", label: "Wrong lane", color: "#f97316" },
  { key: "stop", label: "Stop/Yield", color: "#818cf8" },
  { key: "speed", label: "Speed", color: "#075985" },
  { key: "infiltration", label: "Infiltration", color: "#fcd34d" }
] as const;

function StackedBars({
  data,
  series
}: {
  data: readonly Record<string, number | string>[];
  series: readonly { key: string; label: string; color: string }[];
}) {
  if (data.length === 0) {
    return <EmptyState icon={BarChart3} title="No timeline data for this camera" />;
  }

  return (
    <div className="mt-6 h-64 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data as Record<string, number | string>[]} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12
            }}
            cursor={{ fill: "rgba(49, 87, 168, 0.06)" }}
          />
          <Legend
            formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
            iconType="circle"
          />
          {series.map((item) => (
            <Bar
              dataKey={item.key}
              fill={item.color}
              key={item.key}
              name={item.label}
              radius={[2, 2, 0, 0]}
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraphPanel({ feed }: { feed: CameraFeed }) {
  const { dataset } = useDataset();
  const vehicleTimeline = dataset.vehicleTimelineByFeed[feed.id] ?? [];
  const violationTimeline = dataset.violationTimelineByFeed[feed.id] ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Vehicle Count</h2>
            <p className="mt-4 text-3xl font-bold text-slate-950">
              <AnimatedNumber value={feed.vehicles} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{feed.title} · over time</p>
          </div>
          <button
            aria-label="Download vehicle count"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"
            onClick={() => downloadCsv(`${feed.id}-vehicles.csv`, vehicleColumns, vehicleTimeline)}
            type="button"
          >
            <Download size={18} />
          </button>
        </div>
        <StackedBars data={vehicleTimeline} series={vehicleSeries} />
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Violations</h2>
            <p className="mt-4 text-3xl font-bold text-slate-950">
              <AnimatedNumber value={feed.violations} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{feed.title} · over time</p>
          </div>
          <button
            aria-label="Download violations"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"
            onClick={() => downloadCsv(`${feed.id}-violations.csv`, violationColumns, violationTimeline)}
            type="button"
          >
            <Download size={18} />
          </button>
        </div>
        <StackedBars data={violationTimeline} series={violationSeries} />
      </section>
    </div>
  );
}
