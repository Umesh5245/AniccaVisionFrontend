"use client";

import { VideoOff } from "lucide-react";
import { useState } from "react";
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

export function VideoStage({
  feed,
  videoSrc,
  posterSrc
}: {
  feed: CameraFeed;
  videoSrc: string;
  posterSrc: string;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{feed.title}</h2>
          <p className="text-sm font-medium text-slate-500">{feed.area}</p>
        </div>
      </div>
      <div className="relative bg-slate-950">
        {errored ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-slate-400">
            <VideoOff size={28} />
            <span className="text-sm font-semibold">Video unavailable</span>
          </div>
        ) : (
          <video
            key={feed.id}
            autoPlay
            className="aspect-video w-full object-cover"
            controls
            loop
            muted
            onError={() => setErrored(true)}
            playsInline
            poster={posterSrc}
            preload="auto"
          >
            <source src={videoSrc} type={videoType(feed.format)} />
            This browser does not support this video format.
          </video>
        )}
        <div className="pointer-events-none absolute left-4 top-4 hidden gap-2 sm:flex">
          <span className="rounded-md bg-slate-950/70 px-3 py-1 text-xs font-bold text-white">
            <AnimatedNumber value={feed.confidence} suffix="%" /> confidence
          </span>
        </div>
      </div>
    </section>
  );
}
