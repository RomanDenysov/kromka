"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleAlertIcon,
  Trash2Icon,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatCentsAsEur } from "@/features/ingredients/lib/price-conversion";
import { cn } from "@/lib/utils";
import {
  removeRecipeItemAction,
  reorderRecipeItemsAction,
  updateRecipeItemAction,
} from "../api/actions";

interface ItemDisplayRow {
  hasPrice: boolean;
  id: string;
  kind: "ingredient" | "sub_recipe";
  pctOfBatch: number;
  quantityBaseUnit: number;
  refId: string;
  refName: string;
  totalCostCents: number;
  unit: "g" | "piece";
}

interface Props {
  /** Called when admin removes a row locally (optimistic UI). */
  onLocalRemove: (itemId: string) => void;
  /** Called after a successful server reorder; parent refreshes. */
  onLocalReorder: (orderedIds: string[]) => void;
  /** Called when admin edits a quantity locally (before server save). */
  onLocalUpdate: (itemId: string, qty: number) => void;
  recipeId: string;
  rows: ItemDisplayRow[];
}

/**
 * Items table for the recipe builder. Quantity input is debounced and
 * server-saved on blur. Reorder uses up/down arrows (dnd-kit deferred
 * to a follow-up to keep this PR scoped).
 */
export function RecipeItemsTable({
  recipeId,
  rows,
  onLocalUpdate,
  onLocalRemove,
  onLocalReorder,
}: Props) {
  const [pending, startTransition] = useTransition();

  const handleQtyBlur = (itemId: string, raw: string) => {
    const qty = Number.parseInt(raw, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Množstvo musí byť kladné číslo");
      return;
    }
    startTransition(async () => {
      const res = await updateRecipeItemAction({
        itemId,
        quantityBaseUnit: qty,
      });
      if (!res.success) {
        toast.error(res.error);
      }
    });
  };

  const handleRemove = (itemId: string) => {
    onLocalRemove(itemId);
    startTransition(async () => {
      const res = await removeRecipeItemAction({ itemId });
      if (!res.success) {
        toast.error(res.error);
      }
    });
  };

  const handleMove = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= rows.length) {
      return;
    }
    const newOrder = rows.slice();
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(target, 0, moved);
    const orderedIds = newOrder.map((r) => r.id);
    onLocalReorder(orderedIds);
    startTransition(async () => {
      const res = await reorderRecipeItemsAction({
        recipeId,
        orderedItemIds: orderedIds,
      });
      if (!res.success) {
        toast.error(res.error);
      }
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
        Recept nemá žiadne položky. Pridajte prvú ingredienciu nižšie.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
          <tr>
            <th className="w-8" />
            <th className="px-3 py-2 font-medium">Položka</th>
            <th className="px-3 py-2 font-medium">Množstvo</th>
            <th className="px-3 py-2 font-medium">Cena</th>
            <th className="px-3 py-2 font-medium">% šarže</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              className={cn(
                "border-b",
                !row.hasPrice && "bg-amber-50/40 dark:bg-amber-950/20"
              )}
              key={row.id}
            >
              <td className="px-2 py-1">
                <div className="flex flex-col">
                  <button
                    aria-label="Posunúť hore"
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === 0 || pending}
                    onClick={() => handleMove(idx, -1)}
                    type="button"
                  >
                    <ArrowUpIcon className="size-3" />
                  </button>
                  <button
                    aria-label="Posunúť dolu"
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === rows.length - 1 || pending}
                    onClick={() => handleMove(idx, 1)}
                    type="button"
                  >
                    <ArrowDownIcon className="size-3" />
                  </button>
                </div>
              </td>
              <td className="px-3 py-2">
                <span className="font-medium">
                  {row.kind === "sub_recipe" && (
                    <span className="mr-1">📦</span>
                  )}
                  {row.refName}
                </span>
                {!row.hasPrice && (
                  <span className="ml-2 inline-flex items-center gap-0.5 text-amber-700 text-xs dark:text-amber-400">
                    <CircleAlertIcon className="size-3" />
                    bez ceny
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Input
                    className="w-20"
                    defaultValue={row.quantityBaseUnit}
                    inputMode="numeric"
                    onBlur={(e) => handleQtyBlur(row.id, e.target.value)}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10);
                      if (Number.isFinite(n) && n > 0) {
                        onLocalUpdate(row.id, n);
                      }
                    }}
                    type="number"
                  />
                  <span className="text-muted-foreground text-xs">
                    {row.unit === "g" ? "g" : "ks"}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                {row.hasPrice ? formatCentsAsEur(row.totalCostCents) : "—"}
              </td>
              <td className="px-3 py-2 text-muted-foreground text-xs">
                {row.pctOfBatch.toFixed(0)} %
              </td>
              <td className="px-2 py-1 text-right">
                <Button
                  aria-label="Odstrániť položku"
                  disabled={pending}
                  onClick={() => handleRemove(row.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {pending ? <Spinner /> : <Trash2Icon className="size-4" />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
