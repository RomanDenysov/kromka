import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAllergens } from "@/features/allergens/api/queries";
import { getAdminCategories } from "@/features/categories/api/queries";
import { getAdminPrelinksByProductId } from "@/features/product-prelinks/api/queries";
import {
  type ExistingPrelink,
  ProductPrelinksSection,
} from "@/features/product-prelinks/components/prelinks-section";
import {
  getAdminProductById,
  getAdminProducts,
} from "@/features/products/api/queries";
import {
  getRecipeById,
  getRecipes,
  getResolverContext,
} from "@/features/recipes/api/queries";
import { ProductRecipeCard } from "@/features/recipes/components/product-recipe-card";
import { resolveRecipeCost } from "@/features/recipes/lib/cost-resolver";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { FormContainer } from "./form-container";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function ProductFormLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [product, categories, allergens, prelinkRows, allAdminProducts] =
    await Promise.all([
      getAdminProductById(decodedId),
      getAdminCategories(),
      getAllergens(),
      getAdminPrelinksByProductId(decodedId),
      getAdminProducts(),
    ]);
  if (!product) {
    notFound();
  }

  // Build the Recept card data in parallel with the form.
  const recipeCard = await loadRecipeCard(product.id, product.recipeId ?? null);

  const initialPrelinks: ExistingPrelink[] = prelinkRows.map((row) => ({
    linkedProductId: row.linkedProductId,
    name: row.linkedProduct.name,
    priceCents: row.linkedProduct.priceCents,
    imageUrl: null,
    status: row.linkedProduct.status,
    isActive: row.linkedProduct.isActive,
  }));

  // Enrich with imageUrl from the admin products list (already loaded above).
  const productImageById = new Map(
    allAdminProducts.map((p) => [p.id, p.imageUrl])
  );
  for (const link of initialPrelinks) {
    link.imageUrl = productImageById.get(link.linkedProductId) ?? null;
  }

  const pickerProducts = allAdminProducts.map((p) => ({
    id: p.id,
    name: p.name,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    status: p.status,
    isActive: p.isActive,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid @3xl/page:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <FormContainer
          allergens={allergens}
          categories={categories}
          product={product}
        />
        <div className="@3xl/page:sticky @3xl/page:top-4 @3xl/page:self-start">
          <ProductRecipeCard
            availableProductRecipes={recipeCard.availableProductRecipes}
            linkedRecipe={recipeCard.linkedRecipe}
            productId={product.id}
          />
        </div>
      </div>
      <ProductPrelinksSection
        availableProducts={pickerProducts}
        initialPrelinks={initialPrelinks}
        productId={product.id}
      />
    </div>
  );
}

async function loadRecipeCard(_productId: string, recipeId: string | null) {
  const allProductRecipes = await getRecipes({ kind: "product" });

  if (!recipeId) {
    return {
      linkedRecipe: null,
      availableProductRecipes: allProductRecipes.map((r) => ({
        id: r.id,
        name: r.name,
      })),
    };
  }

  const [recipeRow, ctx] = await Promise.all([
    getRecipeById(recipeId),
    getResolverContext({ includeDrafts: true }),
  ]);

  let costPerUnitCents: number | null = null;
  let resolverError: string | null = null;
  try {
    if (recipeRow) {
      const resolved = resolveRecipeCost(recipeRow.recipe.id, ctx);
      costPerUnitCents = resolved.costPerUnitCents;
    } else {
      resolverError = "Pripojený recept neexistuje.";
    }
  } catch (err) {
    resolverError =
      err instanceof Error ? err.message : "Výpočet nákladov receptu zlyhal.";
  }

  return {
    linkedRecipe: recipeRow
      ? {
          id: recipeRow.recipe.id,
          name: recipeRow.recipe.name,
          status: recipeRow.recipe.status,
          costPerUnitCents,
          resolverError,
        }
      : null,
    availableProductRecipes: allProductRecipes
      .filter((r) => r.id !== recipeId)
      .map((r) => ({ id: r.id, name: r.name })),
  };
}
export default function B2CProductPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: "Upraviť produkt" },
        ]}
      />

      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<FormSkeleton />}>
          <ProductFormLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
