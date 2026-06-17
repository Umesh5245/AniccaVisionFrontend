import { Bell, Headphones, LogOut, UserRound } from "lucide-react";

export function AppHeader({
  onLogout,
  userEmail
}: {
  onLogout: () => void;
  userEmail: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#3157a8] text-sm font-black text-white">
            AV
          </div>
          <span className="truncate text-sm font-semibold text-[#3157a8]">Anicca Vision</span>
        </div>
        <h1 className="order-3 w-full text-center text-sm font-semibold leading-tight text-slate-900 sm:order-none sm:w-auto sm:text-xl">
          Traffic Analytics Dashboard
        </h1>
        <div className="flex items-center justify-end gap-2">
          <button
            aria-label="Support"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100"
            type="button"
          >
            <Headphones size={18} />
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100"
            type="button"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button
            aria-label="Profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#3157a8] text-xs font-bold text-white transition hover:bg-[#264985]"
            title={userEmail}
            type="button"
          >
            <UserRound size={17} />
          </button>
          <button
            aria-label="Logout"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
