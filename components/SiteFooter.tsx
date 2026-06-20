import { AniccaDataLogo } from "@/components/AniccaDataLogo";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-slate-500">
          © {2026} Anicca Vision · Traffic Analytics
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Powered by
          </span>
          <AniccaDataLogo size="sm" />
        </div>
      </div>
    </footer>
  );
}
