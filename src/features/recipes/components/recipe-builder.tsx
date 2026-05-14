"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Allergen } from "@/features/allergens/api/queries";
import { addRecipeItemAction } from "../api/actions";
import {
  type ClientPreview,
  computeClientPreview,
} from "../lib/client-preview";
import type {
  IngredientLite,
  RecipeItemLite,
  RecipeLite,
} from "../lib/cost-resolver";
import type { RecipeHeaderSchema } from "../schema";
import { IngredientPicker } from "./ingredient-picker";
import { LivePreviewPanel } from "./live-preview-panel";
import { RecipeHeaderForm } from "./recipe-header-form";
import { RecipeItemsTable } from "./recipe-items-table";

interface BuilderItem {
  id: string;
  ingredientId: string | null;
  quantityBaseUnit: number;
  sortOrder: number;
  subRecipeId: string | null;
}

interface Props {
  /** All allergens (sk names + icons). */
  allergens: Allergen[];
  /** Catalog snapshot loaded server-side; passed in to feed the resolver. */
  ingredientsMap: Map<string, IngredientLite>;
  initialHeader: RecipeHeaderSchema;
  initialItems: BuilderItem[];
  /** Picker pin sources. */
  mostUsedIds: string[];
  /** Active ingredient catalog for the picker. */
  pickerIngredients: Array<{
    id: string;
    name: string;
    baseUnit: "g" | "piece";
  }>;
  pickerSubRecipes: Array<{ id: string; name: string }>;
  recipeId: string;
  recipesGraph: Map<string, string[]>;
  recipesMap: Map<string, RecipeLite>;
}

const RECENT_KEY = "recipe-builder:recent";
const RECENT_MAX = 10;

function readRecent(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  if (typeof window === "undefined") {
    return;
  }
  const current = readRecent();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be full or disabled (private mode); recent picks are non-essential UX state.
  }
}

export function RecipeBuilder({
  recipeId,
  initialHeader,
  initialItems,
  ingredientsMap,
  recipesMap,
  recipesGraph,
  mostUsedIds,
  allergens,
  pickerIngredients,
  pickerSubRecipes,
}: Props) {
  const [header, setHeader] = useState<RecipeHeaderSchema>(initialHeader);
  const [items, setItems] = useState<BuilderItem[]>(initialItems);
  const [pendingAdd, startAddTransition] = useTransition();

  const usedIds = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) {
      if (it.ingredientId) {
        s.add(it.ingredientId);
      }
      if (it.subRecipeId) {
        s.add(it.subRecipeId);
      }
    }
    return s;
  }, [items]);

  const recentIds = useMemo(() => readRecent(), []);

  const preview: ClientPreview = useMemo(() => {
    const resolverItems: RecipeItemLite[] = items.map((it) => ({
      id: it.id,
      ingredientId: it.ingredientId,
      subRecipeId: it.subRecipeId,
      quantityBaseUnit: it.quantityBaseUnit,
    }));
    return computeClientPreview({
      recipeId,
      recipe: {
        batchYieldUnits: header.batchYieldUnits,
        batchYieldGrams: header.batchYieldGrams,
        yieldLossPercent: header.yieldLossPercent,
      },
      items: resolverItems,
      ctx: { ingredients: ingredientsMap, recipes: recipesMap },
    });
  }, [items, header, recipeId, ingredientsMap, recipesMap]);

  const displayRows = useMemo(() => {
    if (!preview.ok) {
      return [];
    }
    const totalBatch = preview.resolved.batchCostCents;
    return preview.resolved.trace.map((t) => {
      const unit: "g" | "piece" =
        t.kind === "sub_recipe"
          ? "g"
          : (ingredientsMap.get(t.refId)?.baseUnit ?? "g");
      return {
        id: t.itemId ?? "",
        refId: t.refId,
        kind: t.kind,
        refName:
          t.kind === "ingredient"
            ? (ingredientsMap.get(t.refId)?.name ?? t.refId)
            : (recipesMap.get(t.refId)?.name ?? t.refId),
        quantityBaseUnit: t.quantityBaseUnit,
        unit,
        totalCostCents: t.totalCostCents,
        pctOfBatch: totalBatch > 0 ? (t.totalCostCents / totalBatch) * 100 : 0,
        hasPrice: t.hasPrice,
      };
    });
  }, [preview, ingredientsMap, recipesMap]);

  const handlePickIngredient = (ingredientId: string) => {
    pushRecent(ingredientId);
    startAddTransition(async () => {
      const res = await addRecipeItemAction({
        recipeId,
        ingredientId,
        subRecipeId: null,
        quantityBaseUnit: 100,
      });
      if (res.success) {
        setItems((prev) => [
          ...prev,
          {
            id: res.itemId,
            ingredientId,
            subRecipeId: null,
            quantityBaseUnit: 100,
            sortOrder: prev.length,
          },
        ]);
        toast.success("Pridané");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handlePickSubRecipe = (subRecipeId: string) => {
    startAddTransition(async () => {
      const res = await addRecipeItemAction({
        recipeId,
        ingredientId: null,
        subRecipeId,
        quantityBaseUnit: 100,
      });
      if (res.success) {
        setItems((prev) => [
          ...prev,
          {
            id: res.itemId,
            ingredientId: null,
            subRecipeId,
            quantityBaseUnit: 100,
            sortOrder: prev.length,
          },
        ]);
        toast.success("Pridané");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <RecipeHeaderForm
          initial={initialHeader}
          onChange={setHeader}
          recipeId={recipeId}
        />

        <section>
          <h2 className="mb-2 font-semibold text-sm">Položky</h2>
          <RecipeItemsTable
            onLocalRemove={(id) =>
              setItems((prev) => prev.filter((p) => p.id !== id))
            }
            onLocalReorder={(orderedIds) =>
              setItems((prev) => {
                const map = new Map(prev.map((p) => [p.id, p] as const));
                return orderedIds
                  .map((id, idx) => {
                    const found = map.get(id);
                    return found ? { ...found, sortOrder: idx } : null;
                  })
                  .filter((x): x is BuilderItem => Boolean(x));
              })
            }
            onLocalUpdate={(id, qty) =>
              setItems((prev) =>
                prev.map((p) =>
                  p.id === id ? { ...p, quantityBaseUnit: qty } : p
                )
              )
            }
            recipeId={recipeId}
            rows={displayRows}
          />
          <div className="mt-3 flex items-center gap-2">
            <IngredientPicker
              hostRecipeId={recipeId}
              ingredients={pickerIngredients}
              mostUsedIds={mostUsedIds}
              onPickIngredient={handlePickIngredient}
              onPickSubRecipe={handlePickSubRecipe}
              recentIds={recentIds}
              recipesGraph={recipesGraph}
              subRecipes={pickerSubRecipes}
              usedIds={usedIds}
            />
            {pendingAdd && (
              <span className="text-muted-foreground text-xs">Pridávam...</span>
            )}
          </div>
        </section>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <LivePreviewPanel allergens={allergens} preview={preview} />
      </div>
    </div>
  );
}
