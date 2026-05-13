import { CircleAlertIcon, XCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Allergen } from "@/features/allergens/api/queries";
import { AllergenChipStrip } from "@/features/allergens/components/allergen-picker";
import type { AllergenCode } from "@/features/allergens/schema";
import { formatCentsAsEur } from "@/features/ingredients/lib/price-conversion";
import type { ClientPreview } from "../lib/client-preview";

interface Props {
  allergens: Allergen[];
  preview: ClientPreview;
}

/**
 * Sticky right-side panel on the recipe builder. Shows cost per unit,
 * batch cost + yield, derived allergens, and warnings about zero-priced
 * items or missing batch yield grams.
 *
 * Nutrition section is added in Phase D.
 */
export function LivePreviewPanel({ preview, allergens }: Props) {
  if (!preview.ok) {
    return (
      <aside className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="font-semibold text-sm">Živý náhľad</h3>
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          <XCircleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{preview.error}</p>
        </div>
      </aside>
    );
  }

  const r = preview.resolved;
  const withoutPrice = r.trace.filter((t) => !t.hasPrice);
  const noBatchMass = r.finishedMassGrams === 0;

  return (
    <aside className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-sm">Živý náhľad</h3>

      <div>
        <p className="text-muted-foreground text-xs">Cena za kus</p>
        <p className="font-semibold text-2xl tabular-nums">
          {formatCentsAsEur(r.costPerUnitCents)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Šarža</p>
          <p className="font-medium tabular-nums">
            {formatCentsAsEur(r.batchCostCents)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Výnos (čistý)</p>
          <p className="font-medium tabular-nums">{r.finishedMassGrams} g</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-muted-foreground text-xs">Alergény</p>
        {r.allergenCodes.length > 0 ? (
          <AllergenChipStrip
            allergens={allergens}
            codes={r.allergenCodes as AllergenCode[]}
          />
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}
      </div>

      {(withoutPrice.length > 0 || noBatchMass) && (
        <div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-800 text-xs dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {withoutPrice.length > 0 && (
            <div className="flex items-start gap-1.5">
              <CircleAlertIcon className="mt-0.5 size-3 shrink-0" />
              <span>
                {withoutPrice.length} surovín bez ceny — vypočítaná cena je
                neúplná.
              </span>
            </div>
          )}
          {noBatchMass && (
            <div className="flex items-start gap-1.5">
              <CircleAlertIcon className="mt-0.5 size-3 shrink-0" />
              <span>Šarža nemá zadanú hmotnosť (g).</span>
            </div>
          )}
        </div>
      )}

      <Badge className="text-[10px]" variant="secondary">
        Phase D doplní nutričné hodnoty
      </Badge>
    </aside>
  );
}
