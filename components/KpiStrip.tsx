import { Car, Cctv, Gauge, TriangleAlert, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Skeleton } from "@/components/Skeleton";
import type { CameraFeed } from "@/data/traffic";

type Kpi = {
  label: string;
  value: number;
  suffix?: string;
  caption?: string;
  icon: LucideIcon;
  tint: string;
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <article className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${kpi.tint}`}>
        <kpi.icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-slate-950">
          <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {kpi.label}
          {kpi.caption && <span className="text-slate-500"> · {kpi.caption}</span>}
        </p>
      </div>
    </article>
  );
}

export function KpiStrip({ feeds }: { feeds: CameraFeed[] }) {
  const totalVehicles = feeds.reduce((sum, f) => sum + f.vehicles, 0);
  const totalViolations = feeds.reduce((sum, f) => sum + f.violations, 0);
  const avgConfidence = feeds.length
    ? Math.round(feeds.reduce((sum, f) => sum + f.confidence, 0) / feeds.length)
    : 0;
  const liveCount = feeds.filter((f) => f.status === "Live").length;

  const kpis: Kpi[] = [
    { label: "Total Vehicles", value: totalVehicles, icon: Car, tint: "bg-primary/10 text-primary" },
    {
      label: "Violations",
      value: totalViolations,
      icon: TriangleAlert,
      tint: "bg-rose-50 text-rose-600"
    },
    {
      label: "Avg AI Confidence",
      value: avgConfidence,
      suffix: "%",
      icon: Gauge,
      tint: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "Cameras",
      value: feeds.length,
      caption: `${liveCount} live`,
      icon: Cctv,
      tint: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}

export function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          key={i}
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
          <div className="w-full space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
