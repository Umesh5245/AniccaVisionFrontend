// Brand lockup for Anicca Data Science Solutions, recreated as an inline SVG
// (magenta / yellow / teal "A" mark + wordmark). To use the exact brand asset
// instead, drop the file in /public and swap <Mark /> for an <img> / next/image.
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: string; title: string; sub: string; gap: string }> = {
  sm: { mark: "h-6", title: "text-sm", sub: "text-[8px]", gap: "gap-2" },
  md: { mark: "h-9", title: "text-lg", sub: "text-[10px]", gap: "gap-2.5" },
  lg: { mark: "h-14", title: "text-3xl", sub: "text-xs", gap: "gap-3" }
};

const MAGENTA = "#A8408C";
const YELLOW = "#F2C200";
const TEAL = "#1B7FA5";

function Mark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeWidth={5}
      viewBox="0 0 64 44"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* left leg — magenta ribbons */}
      <path d="M6 40 L30 10" stroke={MAGENTA} />
      <path d="M13 40 L30 18" stroke={MAGENTA} />
      <path d="M20 40 L30 26" stroke={MAGENTA} />
      {/* right leg — yellow + teal ribbons */}
      <path d="M34 10 L58 40" stroke={YELLOW} />
      <path d="M34 18 L51 40" stroke={TEAL} />
      <path d="M34 26 L44 40" stroke={TEAL} />
    </svg>
  );
}

export function AniccaDataLogo({
  size = "md",
  showText = true,
  className = ""
}: {
  size?: Size;
  showText?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Mark className={`${s.mark} w-auto`} />
      {showText && (
        <span className="leading-tight">
          <span className={`block font-extrabold tracking-tight text-slate-900 ${s.title}`}>
            Anicca Data
          </span>
          <span
            className={`block font-semibold uppercase tracking-[0.12em] text-brand-teal ${s.sub}`}
          >
            Science Solutions
          </span>
        </span>
      )}
    </span>
  );
}
