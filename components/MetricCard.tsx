import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { Metric } from "@/data/traffic";

const toneStyles: Record<Metric["tone"], string> = {
  amber: "border-amber-300 bg-amber-50 text-amber-600",
  blue: "border-blue-300 bg-blue-50 text-blue-600",
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-600",
  rose: "border-rose-300 bg-rose-50 text-rose-500"
};

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className={`rounded-md border p-4 shadow-sm ${toneStyles[metric.tone]}`}>
      <p className="min-h-10 text-sm font-semibold leading-tight text-slate-950">{metric.label}</p>
      <p className="mt-3 text-2xl font-bold">
        <AnimatedNumber value={metric.value} />
      </p>
    </article>
  );
}
