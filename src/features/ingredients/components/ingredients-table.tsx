"use client";

import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Allergen } from "@/features/allergens/api/queries";
import { AllergenChipStrip } from "@/features/allergens/components/allergen-picker";
import type { AllergenCode } from "@/features/allergens/schema";
import { cn } from "@/lib/utils";
import type { IngredientListRow } from "../api/queries";
import { formatBaseUnit, formatPricePerUnit } from "../lib/format";

interface Props {
  allergens: Allergen[];
  ingredients: IngredientListRow[];
}

export function IngredientsTable({ ingredients, allergens }: Props) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Žiadne suroviny. Vytvorte prvú surovinu tlačidlom „Nová surovina".
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
          <tr>
            <th className="px-3 py-2 font-medium">Názov</th>
            <th className="px-3 py-2 font-medium">Jednotka</th>
            <th className="px-3 py-2 font-medium">Cena</th>
            <th className="px-3 py-2 font-medium">Alergény</th>
            <th className="px-3 py-2 font-medium">Stav</th>
            <th className="px-3 py-2 font-medium">Upravené</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => {
            const noPrice =
              (i.baseUnit === "g" &&
                (i.pricePerKgCents === null || i.pricePerKgCents === 0)) ||
              (i.baseUnit === "piece" &&
                (i.pricePerPieceCents === null || i.pricePerPieceCents === 0));
            const noNutrition = i.nutritionPer100 === null;
            return (
              <tr
                className={cn(
                  "border-b transition-colors hover:bg-muted/30",
                  !i.isActive && "opacity-60"
                )}
                key={i.id}
              >
                <td className="px-3 py-2">
                  <Link
                    className="font-medium hover:underline"
                    href={`/admin/production/ingredients/${i.id}`}
                  >
                    {i.name}
                  </Link>
                  {(noPrice || noNutrition) && (
                    <div className="mt-0.5 flex gap-1 text-amber-600 text-xs dark:text-amber-400">
                      {noPrice && (
                        <span className="inline-flex items-center gap-0.5">
                          <CircleAlertIcon className="size-3" />
                          bez ceny
                        </span>
                      )}
                      {noNutrition && (
                        <span className="inline-flex items-center gap-0.5">
                          <CircleAlertIcon className="size-3" />
                          bez nutrície
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatBaseUnit(i.baseUnit)}
                  {i.baseUnit === "piece" && i.gramsPerPiece ? (
                    <span className="ml-1 text-xs">({i.gramsPerPiece}g)</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {formatPricePerUnit({
                    baseUnit: i.baseUnit,
                    pricePerKgCents: i.pricePerKgCents,
                    pricePerPieceCents: i.pricePerPieceCents,
                  })}
                </td>
                <td className="px-3 py-2">
                  {i.allergenCodes.length > 0 ? (
                    <AllergenChipStrip
                      allergens={allergens}
                      codes={i.allergenCodes as AllergenCode[]}
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {i.isActive ? (
                    <Badge variant="success">Aktívna</Badge>
                  ) : (
                    <Badge variant="secondary">Neaktívna</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  {new Intl.DateTimeFormat("sk-SK", {
                    dateStyle: "medium",
                  }).format(new Date(i.updatedAt))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
