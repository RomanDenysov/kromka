import type { ProfitabilitySummary } from "@/features/reports/api/queries";
import { KpiCard } from "@/features/reports/components/kpi-card";
import { formatEur, formatPct } from "@/features/reports/lib/format";

/**
 * The four profitability scorecards (Tržby / Náklady / Marža € / Marža %),
 * each with a period-over-period delta. Shared by the reports and the
 * per-entity detail pages so the metric set never drifts apart.
 */
export function ProfitabilityKpis({
  summary,
}: {
  summary: ProfitabilitySummary;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        delta={summary.revenueDeltaPct}
        label="Tržby"
        value={formatEur(summary.revenueCents)}
      />
      <KpiCard
        delta={summary.costDeltaPct}
        label="Náklady"
        polarity="up-bad"
        value={formatEur(summary.costCents)}
      />
      <KpiCard
        delta={summary.marginDeltaPct}
        label="Marža (€)"
        value={formatEur(summary.marginCents)}
      />
      <KpiCard
        delta={summary.marginPctDeltaPp}
        deltaUnit="p. b."
        label="Marža %"
        value={formatPct(summary.marginPct)}
      />
    </div>
  );
}

export function ProfitabilityKpisSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          className="h-[88px] animate-pulse rounded-lg border bg-muted/40"
          key={i.toString()}
        />
      ))}
    </div>
  );
}
