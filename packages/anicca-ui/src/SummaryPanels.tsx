import { AnimatedNumber } from "./AnimatedNumber";
import type { CameraFeed } from "./types";

export function SummaryPanels({
  feed,
  hideViolations = false
}: {
  feed: CameraFeed;
  hideViolations?: boolean;
}) {
  return (
    <aside className="space-y-5">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-950">Vehicle Classifications</h2>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {feed.analysis.vehicleClassifications.map((item) => (
            <div
              className="flex items-center justify-between rounded-md bg-surface-muted px-4 py-4 text-sm font-bold text-slate-950"
              key={item.label}
            >
              <span>{item.label}</span>
              <span className="text-primary-deep">
                <AnimatedNumber value={item.value} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {!hideViolations && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Violations</h2>
          <div className="space-y-3">
            {feed.analysis.violationSummary.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm"
                key={item.label}
              >
                <span className="text-sm font-semibold text-slate-950">{item.label}</span>
                <span className="text-2xl font-bold text-rose-600">
                  <AnimatedNumber value={item.value} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
