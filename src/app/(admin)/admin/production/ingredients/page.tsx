import Link from "next/link";
import { Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAllergens } from "@/features/allergens/api/queries";
import { createDraftIngredientAction } from "@/features/ingredients/api/actions";
import { getIngredients } from "@/features/ingredients/api/queries";
import { IngredientsTable } from "@/features/ingredients/components/ingredients-table";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";
import { IngredientsListFilters } from "./_components/ingredients-list-filters";

interface Props {
  searchParams: Promise<{
    search?: string;
    active?: string;
    missing?: string;
  }>;
}

async function IngredientsLoader({ searchParams }: Props) {
  const params = await searchParams;
  let isActive: boolean | undefined;
  if (params.active === "true") {
    isActive = true;
  } else if (params.active === "false") {
    isActive = false;
  }
  const opts = {
    search: params.search,
    isActive,
    missingPrice: params.missing === "price",
    missingNutrition: params.missing === "nutrition",
  };

  const [items, allergens] = await Promise.all([
    getIngredients(opts),
    getAllergens(),
  ]);

  return <IngredientsTable allergens={allergens} ingredients={items} />;
}

export default function IngredientsPage({ searchParams }: Props) {
  // Middleware (src/proxy.ts) guards /admin/* page navigation; per CLAUDE.md
  // we don't call auth guards in pages — they trigger cacheComponents
  // "uncached data outside Suspense" build errors. Server actions still
  // require their own requireIngredientEdit() guard.
  return (
    <section className="@container/page space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<div className="h-9 w-64" />}>
          <IngredientsListFilters />
        </Suspense>
        <div className="flex items-center gap-2">
          <Link
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href="/admin/production/ingredients/duplicates"
          >
            Duplicity
          </Link>

          <form action={createDraftIngredientAction}>
            <Button size="sm" type="submit">
              + Nová surovina
            </Button>
          </form>
        </div>
      </div>

      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={8} />}>
        <IngredientsLoader searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
