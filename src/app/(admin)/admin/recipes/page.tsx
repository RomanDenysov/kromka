import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createRecipeAction } from "@/features/recipes/api/actions";
import { getRecipes } from "@/features/recipes/api/queries";
import { requireRecipeView } from "@/lib/auth/guards";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function RecipesLoader() {
  const all = await getRecipes();

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Žiadne recepty. Vytvorte prvý cez „Nový recept".
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
          <tr>
            <th className="px-3 py-2 font-medium">Názov</th>
            <th className="px-3 py-2 font-medium">Typ</th>
            <th className="px-3 py-2 font-medium">Stav</th>
            <th className="px-3 py-2 font-medium">Výnos</th>
            <th className="px-3 py-2 font-medium">Upravené</th>
          </tr>
        </thead>
        <tbody>
          {all.map((r) => (
            <tr className="border-b hover:bg-muted/30" key={r.id}>
              <td className="px-3 py-2">
                <Link
                  className="font-medium hover:underline"
                  href={`/admin/recipes/${r.id}` as never}
                >
                  {r.name}
                </Link>
              </td>
              <td className="px-3 py-2">
                <Badge variant={r.kind === "product" ? "default" : "secondary"}>
                  {r.kind === "product" ? "Produkt" : "Subrecept"}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <Badge
                  variant={r.status === "published" ? "success" : "outline"}
                >
                  {r.status === "published" ? "Publikovaný" : "Koncept"}
                </Badge>
              </td>
              <td className="px-3 py-2 text-muted-foreground text-xs">
                {r.batchYieldUnits} ks / {r.batchYieldGrams} g
              </td>
              <td className="px-3 py-2 text-muted-foreground text-xs">
                {new Intl.DateTimeFormat("sk-SK", {
                  dateStyle: "medium",
                }).format(new Date(r.updatedAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function RecipesPage() {
  await requireRecipeView();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Recepty" },
        ]}
      />
      <section className="@container/page space-y-4 p-4">
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/admin/recipes/drift">Rozdiely alergénov</a>
          </Button>
          <form action={createSubRecipe}>
            <Button size="sm" type="submit">
              + Nový subrecept
            </Button>
          </form>
        </div>

        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={6} />}>
          <RecipesLoader />
        </Suspense>
      </section>
    </>
  );
}

async function createSubRecipe() {
  "use server";
  await createRecipeAction({ kind: "sub_recipe" });
}
