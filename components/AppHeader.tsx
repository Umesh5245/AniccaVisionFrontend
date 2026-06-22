"use client";

import { Bell, LogOut, TriangleAlert, UserRound } from "lucide-react";
import { useState } from "react";
import { AniccaDataLogo } from "@anicca/ui";
import { useDataset } from "@/components/DataContext";

const VIOLATION_THRESHOLD = 15;
const CONFIDENCE_THRESHOLD = 55;

type Alert = { id: string; title: string; reason: string };

export function AppHeader({
  onLogout,
  userEmail
}: {
  onLogout: () => void;
  userEmail: string;
}) {
  const { dataset } = useDataset();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alerts: Alert[] = dataset.feeds.flatMap((feed) => {
    const reasons: string[] = [];
    if (feed.violations >= VIOLATION_THRESHOLD) reasons.push(`${feed.violations} violations`);
    if (feed.confidence < CONFIDENCE_THRESHOLD) reasons.push(`low confidence ${feed.confidence}%`);
    return reasons.length ? [{ id: feed.id, title: feed.title, reason: reasons.join(" · ") }] : [];
  });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AniccaDataLogo size="sm" />
        </div>
        <h1 className="order-3 w-full text-center text-sm font-semibold leading-tight text-slate-900 sm:order-none sm:w-auto sm:text-xl">
          Traffic Analytics Dashboard
        </h1>
        <div className="flex items-center justify-end gap-2">
          {/* Alerts */}
          <div className="relative">
            <button
              aria-label={`Alerts (${alerts.length})`}
              className="relative grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => {
                setAlertsOpen((o) => !o);
                setMenuOpen(false);
              }}
              type="button"
            >
              <Bell size={18} />
              {alerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {alerts.length}
                </span>
              )}
            </button>
            {alertsOpen && (
              <>
                <button
                  aria-hidden
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setAlertsOpen(false)}
                  tabIndex={-1}
                  type="button"
                />
                <div className="absolute right-0 top-12 z-40 w-72 rounded-md border border-slate-200 bg-white p-1 shadow-soft">
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Alerts ({alerts.length})
                  </p>
                  {alerts.length === 0 ? (
                    <p className="px-3 pb-3 text-sm text-slate-500">All cameras within thresholds.</p>
                  ) : (
                    alerts.map((a) => (
                      <div className="flex items-start gap-2 rounded-md px-3 py-2" key={a.id}>
                        <TriangleAlert className="mt-0.5 shrink-0 text-rose-500" size={15} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{a.title}</p>
                          <p className="text-xs text-slate-500">{a.reason}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-md p-1 pr-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => {
                setMenuOpen((o) => !o);
                setAlertsOpen(false);
              }}
              title={userEmail}
              type="button"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
                <UserRound size={17} />
              </span>
              <span className="hidden max-w-[160px] truncate text-sm font-semibold text-slate-700 md:block">
                {userEmail}
              </span>
            </button>
            {menuOpen && (
              <>
                <button
                  aria-hidden
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={-1}
                  type="button"
                />
                <div className="absolute right-0 top-12 z-40 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-soft" role="menu">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-slate-900">{userEmail}</p>
                  </div>
                  <button
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
