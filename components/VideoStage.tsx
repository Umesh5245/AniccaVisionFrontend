"use client";

import { Activity, CarFront, TriangleAlert, VideoOff } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { CameraFeed } from "@/data/traffic";
import { posterSource, videoSource } from "@/components/VideoCard";

function videoType(format: CameraFeed["format"]) {
  if (format === "avi") {
    return "video/x-msvideo";
  }

  if (format === "mov") {
    return "video/quicktime";
  }

  return "video/mp4";
}

export function VideoStage({ feed }: { feed: CameraFeed }) {
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
            poster={posterSource(feed.file)}
            preload="auto"
          >
            <source src={videoSource(feed.file)} type={videoType(feed.format)} />
            This browser does not support this video format.
          </video>
        )}
        <div className="pointer-events-none absolute left-4 top-4 hidden gap-2 sm:flex">
          <span className="rounded-md bg-slate-950/70 px-3 py-1 text-xs font-bold text-white">
            <AnimatedNumber value={feed.confidence} suffix="%" /> confidence
          </span>
        </div>
      </div>
      <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md bg-slate-100 p-3">
          <CarFront className="text-primary" size={20} />
          <div>
            <p className="text-xs font-semibold text-slate-500">Vehicles</p>
            <p className="text-lg font-bold text-slate-950">
              <AnimatedNumber value={feed.vehicles} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md bg-rose-50 p-3">
          <TriangleAlert className="text-rose-500" size={20} />
          <div>
            <p className="text-xs font-semibold text-rose-600">Violations</p>
            <p className="text-lg font-bold text-rose-700">
              <AnimatedNumber value={feed.violations} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md bg-emerald-50 p-3">
          <Activity className="text-emerald-600" size={20} />
          <div>
            <p className="text-xs font-semibold text-emerald-700">AI Score</p>
            <p className="text-lg font-bold text-emerald-700">
              <AnimatedNumber value={feed.confidence} suffix="%" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
