export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-slate-500">
          © {2022} Anicca Vision 
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Powered by
          </span>
          <img
            alt="Anicca"
            className="h-8 w-auto object-contain"
            src="/anicca-powered-by-logo.png"
          />
        </div>
      </div>
    </footer>
  );
}
