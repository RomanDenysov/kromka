import { DownloadIcon } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  getProductProfitability,
  getProfitabilitySummary,
} from "@/features/reports/api/queries";
import { KpiCard } from "@/features/reports/components/kpi-card";
import { PeriodPicker } from "@/features/reports/components/period-picker";
import {
  formatEur,
  formatPct,
  marginColor,
} from "@/features/reports/lib/format";
import { resolvePeriod } from "@/features/reports/lib/period";
import { requireReportsView } from "@/lib/auth/guards";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

interface Props {
  searchParams: Promise<{ period?: string; minQty?: string }>;
}

async function ProductReport({ searchParams }: Props) {
  const params = await searchParams;
  const preset =
    (params.period as "7d" | "30d" | "90d" | "mtd" | "ytd" | undefined) ??
    "30d";
  const period = resolvePeriod(preset);
  const minQty = Number.parseInt(params.minQty ?? "0", 10) || 0;

  const [summary, rows] = await Promise.all([
    getProfitabilitySummary(period),
    getProductProfitability(period, { minQuantity: minQty }),
  ]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tržby" value={formatEur(summary.revenueCents)} />
        <KpiCard label="Náklady" value={formatEur(summary.costCents)} />
        <KpiCard label="Marža (€)" value={formatEur(summary.marginCents)} />
        <KpiCard label="Marža %" value={formatPct(summary.marginPct)} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          V zvolenom období neboli žiadne predaje.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
              <tr>
                <th className="px-3 py-2 font-medium">Produkt</th>
                <th className="px-3 py-2 font-medium">Kategória</th>
                <th className="px-3 py-2 text-right font-medium">Predané</th>
                <th className="px-3 py-2 text-right font-medium">Tržby</th>
                <th className="px-3 py-2 text-right font-medium">Náklady</th>
                <th className="px-3 py-2 text-right font-medium">Marža</th>
                <th className="px-3 py-2 text-right font-medium">Marža %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-b hover:bg-muted/30" key={r.productId}>
                  <td className="px-3 py-2 font-medium">{r.productName}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {r.categoryName ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.quantitySold}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatEur(r.revenueCents)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatEur(r.costCents)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatEur(r.marginCents)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${marginColor(r.marginPct)}`}
                  >
                    {formatPct(r.marginPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default async function ProductProfitabilityPage({
  searchParams,
}: Props) {
  await requireReportsView();
  const params = await searchParams;
  const preset = params.period ?? "30d";

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reporty", href: "/admin/reports" },
          { label: "Ziskovosť produktov" },
        ]}
      />
      <section className="@container/page space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodPicker basePath="/admin/reports/profitability/products" />
          <Button asChild size="sm" variant="outline">
            <a
              href={`/api/admin/reports/export?report=products&period=${preset}`}
            >
              <DownloadIcon className="mr-1.5 size-4" />
              Stiahnuť CSV
            </a>
          </Button>
        </div>
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
          }
        >
          <ProductReport searchParams={Promise.resolve(params)} />
        </Suspense>
      </section>
    </>
  );
}
