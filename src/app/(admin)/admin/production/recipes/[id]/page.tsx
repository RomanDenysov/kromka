import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAllergens } from "@/features/allergens/api/queries";
import {
  getMostUsedIngredients,
  getRecipeById,
  getRecipeGraph,
  getRecipes,
  getResolverContext,
} from "@/features/recipes/api/queries";
import { RecipeBuilder } from "@/features/recipes/components/recipe-builder";

interface Props {
  params: Promise<{ id: string }>;
}

async function RecipeDetailLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [recipeWithItems, allergens, ctx, graph, mostUsed, allSubRecipes] =
    await Promise.all([
      getRecipeById(decodedId),
      getAllergens(),
      getResolverContext({ includeDrafts: true }),
      getRecipeGraph(),
      getMostUsedIngredients(10),
      getRecipes({ kind: "sub_recipe" }),
    ]);

  if (!recipeWithItems) {
    notFound();
  }
  const { recipe, items } = recipeWithItems;

  // Plain Map for the picker's cycle check (mutable form expected by canAddSubRecipe).
  const recipesGraph = new Map<string, string[]>();
  for (const [k, v] of graph.entries()) {
    recipesGraph.set(k, v);
  }

  const pickerIngredients = Array.from(ctx.ingredients.values()).map((i) => ({
    id: i.id,
    name: i.name,
    baseUnit: i.baseUnit,
  }));

  const pickerSubRecipes = allSubRecipes
    .filter((r) => r.id !== recipe.id)
    .map((r) => ({ id: r.id, name: r.name }));

  const initialHeader = {
    name: recipe.name,
    slug: recipe.slug,
    kind: recipe.kind,
    status: recipe.status,
    batchYieldUnits: recipe.batchYieldUnits,
    batchYieldGrams: recipe.batchYieldGrams,
    yieldLossPercent: recipe.yieldLossPercent,
    notes: recipe.notes,
  };

  return (
    <RecipeBuilder
      allergens={allergens}
      ingredientsMap={ctx.ingredients as Map<string, never>}
      initialHeader={initialHeader}
      initialItems={items.map((it) => ({
        id: it.id,
        ingredientId: it.ingredientId,
        subRecipeId: it.subRecipeId,
        quantityBaseUnit: it.quantityBaseUnit,
        sortOrder: it.sortOrder,
      }))}
      mostUsedIds={mostUsed.map((m) => m.id)}
      pickerIngredients={pickerIngredients}
      pickerSubRecipes={pickerSubRecipes}
      recipeId={recipe.id}
      recipesGraph={recipesGraph}
      recipesMap={ctx.recipes as Map<string, never>}
    />
  );
}

export default function RecipeDetailPage({ params }: Props) {
  // Middleware guards /admin/*; server actions handle mutations.
  return (
    <section className="@container/page p-4">
      <Suspense fallback={<FormSkeleton />}>
        <RecipeDetailLoader params={params} />
      </Suspense>
    </section>
  );
}
