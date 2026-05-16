import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import type { IngredientBaseUnit } from "@/db/schema";
import { formatCentsAsEur } from "../lib/price-conversion";

interface PriceHistoryRow {
  effectiveFrom: Date;
  id: string;
  notes: string | null;
  pricePerKgCents: number | null;
  pricePerPieceCents: number | null;
  source: string;
  supplierName: string | null;
}

interface Props {
  baseUnit: IngredientBaseUnit;
  history: PriceHistoryRow[];
}

/**
 * Right-side panel on the ingredient detail page showing the last N
 * price changes. List, not chart — chart is a nice-to-have for later.
 */
export function PriceHistoryPanel({ baseUnit, history }: Props) {
  const unitLabel = baseUnit === "g" ? "/ kg" : "/ ks";

  return (
    <aside className="rounded-lg border bg-card">
      <header className="border-b px-4 py-3">
        <h3 className="font-semibold">História cien</h3>
        <p className="text-muted-foreground text-xs">
          Posledné zmeny ceny v {baseUnit === "g" ? "cents/kg" : "cents/ks"}.
        </p>
      </header>

      {history.length === 0 ? (
        <div className="p-4 text-muted-foreground text-sm">
          Žiadne zmeny v histórii.
        </div>
      ) : (
        <ol className="divide-y">
          {history.map((row) => {
            const cents =
              baseUnit === "g" ? row.pricePerKgCents : row.pricePerPieceCents;
            return (
              <li className="space-y-1 px-4 py-3 text-sm" key={row.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {formatCentsAsEur(cents)} {unitLabel}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(row.effectiveFrom), "d. LLL yyyy", {
                      locale: sk,
                    })}
                  </span>
                </div>
                {(row.supplierName || row.source !== "manual") && (
                  <p className="text-muted-foreground text-xs">
                    {row.supplierName ?? ""}
                    {row.supplierName && row.source !== "manual" ? " · " : ""}
                    {row.source === "manual" ? "" : row.source}
                  </p>
                )}
                {row.notes && (
                  <p className="text-muted-foreground text-xs italic">
                    {row.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
