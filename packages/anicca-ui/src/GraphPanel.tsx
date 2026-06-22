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
import { AnimatedNumber } from "./AnimatedNumber";
import { downloadCsv } from "./csv";
import { EmptyState } from "./EmptyState";
import type { CameraFeed, VehicleBucket } from "./types";

const vehicleColumns = [
  { key: "label", label: "Time" },
  { key: "car", label: "Cars" },
  { key: "motorcycle", label: "Motorcycles" },
  { key: "truck", label: "Trucks" },
  { key: "bus", label: "Buses" },
  { key: "bicycle", label: "Bicycles" }
];

const violationColumns = [
  { key: "label", label: "Violation Type" },
  { key: "value", label: "Count" }
];

const vehicleSeries = [
  { key: "car", label: "Car", color: "#3157a8" },
  { key: "motorcycle", label: "Motorcycle", color: "#818cf8" },
  { key: "truck", label: "Trucks", color: "#f97316" },
  { key: "bus", label: "Buses", color: "#fcd34d" },
  { key: "bicycle", label: "Bicycle", color: "#10b981" }
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
    <div className="mt-6 h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data as Record<string, number | string>[]}
          margin={{ top: 8, right: 8, bottom: 26, left: 12 }}
        >
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            height={42}
            label={{
              value: "Time (m:ss)",
              position: "insideBottom",
              offset: -6,
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600
            }}
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            label={{
              value: "Vehicles (count)",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600
            }}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            width={58}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
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

function SummaryBars({ data }: { data: readonly { label: string; value: number }[] }) {
  if (data.length === 0) {
    return <EmptyState icon={BarChart3} title="No violation data for this camera" />;
  }

  return (
    <div className="mt-6 h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, bottom: 26, left: 24 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e8f0" />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            height={42}
            label={{
              value: "Violations (count)",
              position: "insideBottom",
              offset: -6,
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600
            }}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            label={{
              value: "Violation type",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600
            }}
            tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            type="category"
            width={160}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            cursor={{ fill: "rgba(225, 29, 72, 0.06)" }}
          />
          <Bar dataKey="value" fill="#e11d48" name="Count" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraphPanel({
  feed,
  vehicleTimeline
}: {
  feed: CameraFeed;
  vehicleTimeline: VehicleBucket[];
}) {
  const violationSummary = feed.analysis.violationSummary.map(({ label, value }) => ({
    label,
    value
  }));
  const violationTotal = violationSummary.reduce((sum, item) => sum + item.value, 0);

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
              <AnimatedNumber value={violationTotal} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {feed.title} · Data View summary
            </p>
          </div>
          <button
            aria-label="Download violations"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"
            onClick={() => downloadCsv(`${feed.id}-violations.csv`, violationColumns, violationSummary)}
            type="button"
          >
            <Download size={18} />
          </button>
        </div>
        <SummaryBars data={violationSummary} />
      </section>
    </div>
  );
}
