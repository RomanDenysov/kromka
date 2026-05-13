import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getAllergens } from "@/features/allergens/api/queries";
import { createDraftIngredientAction } from "@/features/ingredients/api/actions";
import { getIngredients } from "@/features/ingredients/api/queries";
import { IngredientsTable } from "@/features/ingredients/components/ingredients-table";
import { requireIngredientEdit } from "@/lib/auth/guards";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
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

export default async function IngredientsPage({ searchParams }: Props) {
  await requireIngredientEdit();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Suroviny" },
        ]}
      />
      <section className="@container/page space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <IngredientsListFilters />
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="/admin/ingredients/duplicates">Duplicity</a>
            </Button>
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
    </>
  );
}
