import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { getProfitabilitySummary } from "../api/queries";
import { formatEur, formatPct, marginColor } from "../lib/format";
import { resolvePeriod } from "../lib/period";

/**
 * Last-30-days profitability summary card. Drops into the admin
 * landing page so admins see "did we make money" without navigating.
 */
export async function DashboardProfitWidget() {
  await connection();
  const period = resolvePeriod("30d");
  const summary = await getProfitabilitySummary(period);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">Ziskovosť (30 dní)</p>
          <p className="text-muted-foreground text-xs">
            Hrubá marža bez réžie a miezd.
          </p>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/reports">Otvoriť ↗</Link>
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Tržby</p>
          <p className="font-semibold tabular-nums">
            {formatEur(summary.revenueCents)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Náklady</p>
          <p className="font-semibold tabular-nums">
            {formatEur(summary.costCents)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Marža</p>
          <p
            className={`font-semibold tabular-nums ${marginColor(summary.marginPct)}`}
          >
            {formatPct(summary.marginPct)}
          </p>
        </div>
      </div>

      {summary.untrackedShare > 0.05 && (
        <p className="mt-2 text-muted-foreground text-xs">
          Náklady chýbajú pre {Math.round(summary.untrackedShare * 100)} %
          objednávok (staršie než Phase C).
        </p>
      )}
    </div>
  );
}
