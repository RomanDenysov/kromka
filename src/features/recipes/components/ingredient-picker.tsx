"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type CanAddResult, canAddSubRecipe } from "../lib/cost-resolver";

interface IngredientOption {
  baseUnit: "g" | "piece";
  id: string;
  name: string;
}

interface SubRecipeOption {
  id: string;
  name: string;
}

interface Props {
  /** This recipe's id; used to filter self + cycle candidates. */
  hostRecipeId: string;
  ingredients: IngredientOption[];
  mostUsedIds?: string[];
  onPickIngredient: (ingredientId: string) => void;
  onPickSubRecipe: (subRecipeId: string) => void;
  /** Pinned at top of the list. */
  recentIds?: string[];
  /** Adjacency map for cycle/depth check on sub-recipes. */
  recipesGraph: ReadonlyMap<string, readonly string[]>;
  subRecipes: SubRecipeOption[];
  /** Set of ingredient/sub-recipe IDs already in the current recipe. */
  usedIds: Set<string>;
}

/**
 * Single-add `<Command>` palette. Lists ingredients + sub-recipes; the
 * dual-mode "Z iného receptu" tab is deferred to a follow-up (admin can
 * use the recipe Duplikovať flow for now).
 */
export function IngredientPicker({
  ingredients,
  subRecipes,
  usedIds,
  recipesGraph,
  hostRecipeId,
  recentIds = [],
  mostUsedIds = [],
  onPickIngredient,
  onPickSubRecipe,
}: Props) {
  const [open, setOpen] = useState(false);

  const filteredIngredients = useMemo(
    () => ingredients.filter((i) => !usedIds.has(i.id)),
    [ingredients, usedIds]
  );

  const filteredSubRecipes = useMemo(() => {
    return subRecipes
      .filter((r) => !usedIds.has(r.id))
      .map((r) => ({
        ...r,
        check: canAddSubRecipe(hostRecipeId, r.id, recipesGraph),
      }))
      .filter(
        (r): r is SubRecipeOption & { check: CanAddResult } => r.check.ok
      );
  }, [subRecipes, usedIds, recipesGraph, hostRecipeId]);

  const pinnedRecent = recentIds
    .map((id) => filteredIngredients.find((i) => i.id === id))
    .filter((x): x is IngredientOption => Boolean(x));
  const pinnedFrequent = mostUsedIds
    .filter((id) => !recentIds.includes(id))
    .map((id) => filteredIngredients.find((i) => i.id === id))
    .filter((x): x is IngredientOption => Boolean(x));

  const handlePickIngredient = (id: string) => {
    onPickIngredient(id);
    setOpen(false);
  };
  const handlePickSubRecipe = (id: string) => {
    onPickSubRecipe(id);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm hover:bg-accent"
          type="button"
        >
          <PlusIcon className="size-4" />
          Pridať ingredienciu / subrecept
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">Vybrať položku</DialogTitle>
          <DialogDescription className="text-xs">
            Začnite písať pre fuzzy vyhľadávanie. „muka" nájde „Hladká múka
            T650".
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Hľadať..." />
          <CommandList>
            <CommandEmpty>Nič sa nenašlo</CommandEmpty>

            {pinnedRecent.length > 0 && (
              <CommandGroup heading="Naposledy použité">
                {pinnedRecent.map((i) => (
                  <CommandItem
                    key={`r-${i.id}`}
                    onSelect={() => handlePickIngredient(i.id)}
                    value={i.name}
                  >
                    {i.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {pinnedFrequent.length > 0 && (
              <CommandGroup heading="Najčastejšie">
                {pinnedFrequent.map((i) => (
                  <CommandItem
                    key={`f-${i.id}`}
                    onSelect={() => handlePickIngredient(i.id)}
                    value={i.name}
                  >
                    {i.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Ingrediencie">
              {filteredIngredients.map((i) => (
                <CommandItem
                  key={i.id}
                  onSelect={() => handlePickIngredient(i.id)}
                  value={i.name}
                >
                  <span className="flex-1">{i.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {i.baseUnit === "g" ? "g" : "ks"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            {filteredSubRecipes.length > 0 && (
              <CommandGroup heading="Subrecepty">
                {filteredSubRecipes.map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() => handlePickSubRecipe(r.id)}
                    value={`subrecept ${r.name}`}
                  >
                    <span className="mr-2">📦</span>
                    <span className="flex-1">{r.name}</span>
                    <span className="text-muted-foreground text-xs">g</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Iné">
              <CommandItem asChild>
                <Link
                  className="cursor-pointer"
                  href={"/admin/production/ingredients" as never}
                  target="_blank"
                >
                  + Vytvoriť novú surovinu (nová karta)
                </Link>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
