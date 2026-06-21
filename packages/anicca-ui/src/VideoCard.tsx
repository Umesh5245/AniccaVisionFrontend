"use client";

import { Check, ShieldCheck, VideoOff } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import type { CameraFeed } from "./types";

function videoType(format: CameraFeed["format"]) {
  if (format === "avi") {
    return "video/x-msvideo";
  }

  if (format === "mov") {
    return "video/quicktime";
  }

  return "video/mp4";
}

export function VideoCard({
  feed,
  selected,
  videoSrc,
  posterSrc,
  onSelect
}: {
  feed: CameraFeed;
  selected: boolean;
  videoSrc: string;
  posterSrc: string;
  onSelect: () => void;
}) {
  const [errored, setErrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      aria-label={`View ${feed.title} in main player`}
      aria-pressed={selected}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected ? "border-primary ring-2 ring-primary/15" : "border-slate-200"
      }`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Stop clicks on the video (play/seek controls) from selecting the card;
          play on hover instead of autoplaying every card at once. */}
      <div
        className="relative aspect-video overflow-hidden bg-slate-950"
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => videoRef.current?.pause()}
      >
        {errored ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
            <VideoOff size={22} />
            <span className="text-xs font-semibold">Video unavailable</span>
          </div>
        ) : (
          <video
            className="h-full w-full object-contain opacity-90 transition group-hover:opacity-100"
            controls
            loop
            muted
            onError={() => setErrored(true)}
            playsInline
            poster={posterSrc}
            preload="metadata"
            ref={videoRef}
          >
            <source src={videoSrc} type={videoType(feed.format)} />
          </video>
        )}
        <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
          {feed.format.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{feed.title}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{feed.area}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-md bg-slate-100 px-2 py-2">
            <strong className="block text-sm text-slate-950">
              <AnimatedNumber value={feed.vehicles} />
            </strong>
            Vehicles
          </span>
          <span className="rounded-md bg-rose-50 px-2 py-2 text-rose-700">
            <strong className="block text-sm">
              <AnimatedNumber value={feed.violations} />
            </strong>
            Violations
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-700">
            <strong className="block text-sm">
              <AnimatedNumber value={feed.confidence} suffix="%" />
            </strong>
            AI score
          </span>
        </div>
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <ShieldCheck size={14} />
          {feed.highlight}
        </p>
        <p
          className={`mt-auto inline-flex items-center gap-1 text-xs font-bold ${
            selected ? "text-primary" : "text-slate-500 group-hover:text-primary"
          }`}
        >
          {selected ? (
            <>
              <Check size={14} /> Showing in main player
            </>
          ) : (
            "Click to view in main player"
          )}
        </p>
      </div>
    </article>
  );
}
