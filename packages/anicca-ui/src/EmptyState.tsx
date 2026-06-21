import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  className = ""
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-4 py-10 text-center ${className}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {hint && <p className="max-w-xs text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
