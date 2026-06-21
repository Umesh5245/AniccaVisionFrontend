"use client";

import { Cctv } from "lucide-react";
import { useState } from "react";
import { posterSource } from "@/components/VideoCard";
import type { CameraFeed } from "@/data/traffic";

function Thumb({
  feed,
  selected,
  onSelect
}: {
  feed: CameraFeed;
  selected: boolean;
  onSelect: () => void;
}) {
  const [errored, setErrored] = useState(false);
  const live = feed.status === "Live";

  return (
    <button
      aria-label={`Select ${feed.area} camera`}
      aria-pressed={selected}
      className={`group relative w-40 shrink-0 overflow-hidden rounded-lg border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-slate-200 hover:border-slate-300"
      }`}
      onClick={onSelect}
      title={feed.title}
      type="button"
    >
      <div className="relative aspect-video bg-slate-900">
        {errored ? (
          <div className="grid h-full place-items-center text-slate-500">
            <Cctv size={20} />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-full w-full object-cover transition group-hover:opacity-90"
            onError={() => setErrored(true)}
            src={posterSource(feed.file)}
          />
        )}
        <span
          aria-hidden
          className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-black/30 ${
            live ? "animate-pulse bg-emerald-400" : "bg-amber-400"
          }`}
        />
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-semibold text-slate-900">{feed.area}</p>
        <p className="truncate text-[10px] font-medium text-slate-500">{feed.title}</p>
      </div>
    </button>
  );
}

export function CameraSwitcher({
  feeds,
  selectedId,
  onSelect
}: {
  feeds: CameraFeed[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Cameras" role="tablist">
      {feeds.map((feed) => (
        <Thumb
          feed={feed}
          key={feed.id}
          onSelect={() => onSelect(feed.id)}
          selected={feed.id === selectedId}
        />
      ))}
    </div>
  );
}
