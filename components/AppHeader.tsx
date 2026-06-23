"use client";

import {
  Bell,
  CheckCheck,
  Clock3,
  Loader2,
  LogOut,
  RefreshCw,
  TriangleAlert,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AniccaDataLogo } from "@anicca/ui";
import { useDataset } from "@/components/DataContext";

const VIOLATION_THRESHOLD = 15;
const CONFIDENCE_THRESHOLD = 55;
const READ_NOTIFICATIONS_KEY = "anicca-vision-read-notifications";

type NotificationSeverity = "critical" | "warning" | "info";

type NotificationItem = {
  id: string;
  feedId?: string;
  title: string;
  reason: string;
  severity: NotificationSeverity;
};

const severityRank: Record<NotificationSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2
};

export function AppHeader({
  onLogout,
  userEmail,
  onSelectFeed
}: {
  onLogout: () => void;
  userEmail: string;
  onSelectFeed?: (feedId: string) => void;
}) {
  const { dataset, job, refresh, source } = useDataset();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    if (job.active) {
      items.push({
        id: `job:${job.status}:${job.label}`,
        title: job.status === "error" ? "Analysis needs attention" : "Analysis job update",
        reason: job.label,
        severity: job.status === "error" ? "critical" : job.status === "done" ? "info" : "warning"
      });
    }

    for (const feed of dataset.feeds) {
      if (feed.violations >= VIOLATION_THRESHOLD) {
        const topViolation = feed.analysis.violationSummary
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value)[0];

        items.push({
          id: `${feed.id}:violations:${feed.violations}`,
          feedId: feed.id,
          title: feed.title,
          reason: `${feed.violations} violations${
            topViolation ? ` · top: ${topViolation.label} (${topViolation.value})` : ""
          }`,
          severity: "critical"
        });
      }

      if (feed.confidence < CONFIDENCE_THRESHOLD) {
        items.push({
          id: `${feed.id}:confidence:${feed.confidence}`,
          feedId: feed.id,
          title: feed.title,
          reason: `Low AI confidence: ${feed.confidence}%`,
          severity: "warning"
        });
      }

      if (feed.status === "Review") {
        items.push({
          id: `${feed.id}:review:${feed.violations}:${feed.confidence}`,
          feedId: feed.id,
          title: feed.title,
          reason: "Camera is marked for review",
          severity: "info"
        });
      }

      if (feed.analyzedAt) {
        items.push({
          id: `${feed.id}:updated:${feed.analyzedAt}`,
          feedId: feed.id,
          title: feed.title,
          reason: "Fresh analysis results are available",
          severity: "info"
        });
      }
    }

    return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }, [dataset.feeds, job]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_NOTIFICATIONS_KEY);
      if (raw) {
        setReadIds(new Set(JSON.parse(raw) as string[]));
      }
    } catch {
      setReadIds(new Set());
    }
  }, []);

  useEffect(() => {
    setReadIds((current) => {
      const activeIds = new Set(notifications.map((notification) => notification.id));
      const next = new Set([...current].filter((id) => activeIds.has(id)));
      const changed = next.size !== current.size || [...next].some((id) => !current.has(id));

      if (changed) {
        persistReadIds(next);
        return next;
      }

      return current;
    });
  }, [notifications]);

  function persistReadIds(next: Set<string>) {
    try {
      window.localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...next]));
    } catch {
      // Read state can stay in memory if browser storage is unavailable.
    }
  }

  function markAsRead(ids: string[]) {
    setReadIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.add(id));
      persistReadIds(next);
      return next;
    });
  }

  async function handleRefreshNotifications() {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  const unreadCount = notifications.filter((notification) => !readIds.has(notification.id)).length;
  const sourceLabel =
    source === "live" ? "Live data" : source === "loading" ? "Loading data" : "Demo data";

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
              aria-expanded={notificationsOpen}
              aria-haspopup="menu"
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => {
                setNotificationsOpen((o) => !o);
                setMenuOpen(false);
              }}
              type="button"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <>
                <button
                  aria-hidden
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setNotificationsOpen(false)}
                  tabIndex={-1}
                  type="button"
                />
                <div
                  className="absolute right-0 top-12 z-40 w-80 rounded-md border border-slate-200 bg-white p-1 shadow-soft"
                  role="menu"
                >
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Notifications
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {unreadCount} unread · {sourceLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="Refresh notifications"
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isRefreshing}
                        onClick={handleRefreshNotifications}
                        type="button"
                      >
                        {isRefreshing ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                      </button>
                      <button
                        aria-label="Mark all notifications as read"
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={unreadCount === 0}
                        onClick={() =>
                          markAsRead(notifications.map((notification) => notification.id))
                        }
                        type="button"
                      >
                        <CheckCheck size={16} />
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-3 pb-3 text-sm text-slate-500">
                      All cameras are within current thresholds.
                    </p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => {
                        const unread = !readIds.has(notification.id);
                        const Icon = notification.severity === "info" ? Clock3 : TriangleAlert;

                        return (
                          <button
                            className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left transition hover:bg-slate-50 ${
                              unread ? "bg-primary/5" : ""
                            }`}
                            key={notification.id}
                            onClick={() => {
                              markAsRead([notification.id]);
                              if (notification.feedId) {
                                onSelectFeed?.(notification.feedId);
                                setNotificationsOpen(false);
                              }
                            }}
                            role="menuitem"
                            type="button"
                          >
                            <Icon
                              className={`mt-0.5 shrink-0 ${
                                notification.severity === "critical"
                                  ? "text-rose-500"
                                  : notification.severity === "warning"
                                    ? "text-amber-500"
                                    : "text-primary"
                              }`}
                              size={15}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                {unread && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{notification.reason}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
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
                setNotificationsOpen(false);
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
