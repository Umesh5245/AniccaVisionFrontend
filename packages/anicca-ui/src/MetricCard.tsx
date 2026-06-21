import {
  CarFront,
  Footprints,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Truck,
  type LucideIcon
} from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import type { Metric } from "./types";

const toneStyles: Record<
  Metric["tone"],
  { icon: LucideIcon; accent: string; chipBg: string; chipText: string }
> = {
  rose: { icon: CarFront, accent: "bg-rose-500", chipBg: "bg-rose-50", chipText: "text-rose-600" },
  amber: {
    icon: Footprints,
    accent: "bg-amber-500",
    chipBg: "bg-amber-50",
    chipText: "text-amber-600"
  },
  emerald: {
    icon: Truck,
    accent: "bg-emerald-500",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-600"
  },
  blue: {
    icon: TriangleAlert,
    accent: "bg-blue-500",
    chipBg: "bg-blue-50",
    chipText: "text-blue-600"
  }
};

export function MetricCard({ metric }: { metric: Metric }) {
  const tone = toneStyles[metric.tone];
  const Icon = tone.icon;
  const { delta } = metric;

  return (
    <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-md ${tone.chipBg} ${tone.chipText}`}>
          <Icon size={18} />
        </span>
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              delta > 0
                ? "bg-emerald-50 text-emerald-700"
                : delta < 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-500"
            }`}
            title="vs fleet average"
          >
            {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : null}
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">
        <AnimatedNumber value={metric.value} />
      </p>
      <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-500">{metric.label}</p>
    </article>
  );
}
