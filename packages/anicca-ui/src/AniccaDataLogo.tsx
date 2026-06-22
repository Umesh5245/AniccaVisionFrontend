// Brand lockup for Anicca Vision, using the app-owned PNG mark in /public.
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: string; title: string; sub: string; gap: string }> = {
  sm: { mark: "h-7 w-7", title: "text-sm", sub: "text-[8px]", gap: "gap-2" },
  md: { mark: "h-10 w-10", title: "text-lg", sub: "text-[10px]", gap: "gap-2.5" },
  lg: { mark: "h-14 w-14", title: "text-3xl", sub: "text-xs", gap: "gap-3" }
};

export function AniccaDataLogo({
  size = "md",
  showText = true,
  className = "",
  textClassName = "text-slate-900",
  subtitleClassName = "text-brand-teal"
}: {
  size?: Size;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  subtitleClassName?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <img
        alt={showText ? "" : "Anicca Vision"}
        aria-hidden={showText}
        className={`${s.mark} shrink-0 object-contain`}
        src="/anicca-vision-logo.png"
      />
      {showText && (
        <span className="leading-tight">
          <span className={`block font-extrabold tracking-tight ${textClassName} ${s.title}`}>
            Anicca Vision
          </span>
          <span
            className={`block font-semibold uppercase tracking-[0.12em] ${subtitleClassName} ${s.sub}`}
          >
            Traffic Analytics
          </span>
        </span>
      )}
    </span>
  );
}
