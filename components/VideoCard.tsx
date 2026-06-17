import { Radio, ShieldCheck } from "lucide-react";
import type { CameraFeed } from "@/data/traffic";

function videoType(format: CameraFeed["format"]) {
  if (format === "avi") {
    return "video/x-msvideo";
  }

  if (format === "mov") {
    return "video/quicktime";
  }

  return "video/mp4";
}

export function videoSource(file: string) {
  return `/api/video/${encodeURIComponent(file)}`;
}

export function VideoCard({
  feed,
  selected,
  onSelect
}: {
  feed: CameraFeed;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-md border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
        selected ? "border-[#3157a8] ring-2 ring-[#3157a8]/15" : "border-slate-200"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <video
          autoPlay
          className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          controls
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSource(feed.file)} type={videoType(feed.format)} />
        </video>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">
          <Radio size={13} />
          {feed.status}
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
          {feed.format.toUpperCase()}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{feed.title}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{feed.area}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-md bg-slate-100 px-2 py-2">
            <strong className="block text-sm text-slate-950">{feed.vehicles}</strong>
            Vehicles
          </span>
          <span className="rounded-md bg-rose-50 px-2 py-2 text-rose-700">
            <strong className="block text-sm">{feed.violations}</strong>
            Violations
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-700">
            <strong className="block text-sm">{feed.confidence}%</strong>
            AI score
          </span>
        </div>
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#3157a8]">
          <ShieldCheck size={14} />
          {feed.highlight}
        </p>
        <button
          className="h-9 w-full rounded-md bg-[#3157a8] text-sm font-bold text-white transition hover:bg-[#264985]"
          onClick={onSelect}
          type="button"
        >
          View in main player
        </button>
      </div>
    </article>
  );
}
