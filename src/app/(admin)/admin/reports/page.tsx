import { BarChart3Icon, PackageIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getProfitabilitySummary } from "@/features/reports/api/queries";
import { KpiCard } from "@/features/reports/components/kpi-card";
import {
  formatEur,
  formatPct,
  marginColor,
} from "@/features/reports/lib/format";
import { resolvePeriod } from "@/features/reports/lib/period";
import { requireReportsView } from "@/lib/auth/guards";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

async function SummaryStrip() {
  const period = resolvePeriod("30d");
  const summary = await getProfitabilitySummary(period);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        hint="Posledných 30 dní"
        label="Tržby"
        value={formatEur(summary.revenueCents)}
      />
      <KpiCard label="Náklady" value={formatEur(summary.costCents)} />
      <KpiCard label="Marža (€)" value={formatEur(summary.marginCents)} />
      <KpiCard
        className={marginColor(summary.marginPct)}
        label="Marža %"
        value={formatPct(summary.marginPct)}
      />
    </div>
  );
}

const REPORT_LINKS = [
  {
    href: "/admin/reports/profitability/stores",
    label: "Ziskovosť predajní",
    description: "Tržby, náklady a marža podľa predajne.",
    icon: StoreIcon,
  },
  {
    href: "/admin/reports/profitability/products",
    label: "Ziskovosť produktov",
    description:
      "Ktoré produkty zarábajú najviac. Zoradené podľa hrubej marže.",
    icon: PackageIcon,
  },
] as const;

export default async function ReportsLandingPage() {
  await requireReportsView();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reporty" },
        ]}
      />
      <section className="@container/page space-y-6 p-4">
        <Suspense
          fallback={
            <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
          }
        >
          <SummaryStrip />
        </Suspense>

        <div className="grid gap-3 sm:grid-cols-2">
          {REPORT_LINKS.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                href={r.href as never}
                key={r.href}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="size-5 text-muted-foreground group-hover:text-foreground" />
                  <h3 className="font-semibold text-sm">{r.label}</h3>
                </div>
                <p className="text-muted-foreground text-xs">{r.description}</p>
              </Link>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <BarChart3Icon className="size-3" />
          Reporty používajú hrubú maržu (tržby − náklady na výrobu). Réžia, mzdy
          a iné prevádzkové náklady tu nie sú zahrnuté.
        </p>
      </section>
    </>
  );
}
