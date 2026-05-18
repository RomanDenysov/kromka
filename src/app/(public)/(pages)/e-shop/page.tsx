import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import {
  CategoriesSidebar,
  CategoriesSidebarSkeleton,
} from "@/components/filters/categories-sidebar";
import {
  SortToggles,
  SortTogglesSkeleton,
} from "@/components/filters/sort-toggles";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { ReorderBar } from "@/features/buy-again-banner/components/reorder-bar";
import { getCategories } from "@/features/categories/api/queries";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "@/features/products/components/products-grid";
import { createMetadata } from "@/lib/metadata";
import { getCollectionPageSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";
import { CategoriesChips, CategoriesChipsSkeleton } from "./categories-chips";
import { loadEshopParams } from "./eshop-params";
import { ProductSearch, ProductSearchSkeleton } from "./product-search";

interface Props {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = createMetadata({
  title: "Naše produkty - chlieb, pečivo a koláče | Kromka e-shop",
  description:
    "Objavte širokú ponuku tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý domáci chlieb, pečivo, koláče a iné špeciality pečené s láskou a podľa tradičných receptov. Nakupujte online.",
  canonicalUrl: getSiteUrl("/e-shop"),
  image: "/images/kromka-vianoce-hero-min.webp",
});

export default function EshopPage({ searchParams }: Props) {
  const categoriesPromise = getCategories();
  const eshopParams = loadEshopParams(searchParams);
  const lastOrderPromise = getLastOrderWithItemsAction();
  return (
    <>
      <JsonLd data={[getCollectionPageSchema()]} />
      <PageWrapper>
        <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
        <div className="space-y-2">
          <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
            Naše produkty
          </h1>
          <p className="text-muted-foreground">
            Chlieb, pečivo, koláče a lokálne lakomky z Pekárne Kromka.
          </p>
        </div>
        <Suspense>
          <ReorderBar lastOrderPromise={lastOrderPromise} />
        </Suspense>

        <div className="relative grid min-h-[calc(100svh-5rem)] w-full items-start gap-8 pt-2 md:grid-cols-[12rem_1fr]">
          <Suspense fallback={<CategoriesSidebarSkeleton />}>
            <CategoriesSidebar categories={categoriesPromise} />
          </Suspense>
          <div className="min-w-0 space-y-4">
            <div className="flex items-center justify-between gap-8">
              <Suspense fallback={<ProductSearchSkeleton />}>
                <ProductSearch />
              </Suspense>
              <div className="hidden md:block">
                <Suspense fallback={<SortTogglesSkeleton />}>
                  <SortToggles />
                </Suspense>
              </div>
            </div>
            <Suspense fallback={<CategoriesChipsSkeleton />}>
              <CategoriesChips categories={categoriesPromise} />
            </Suspense>
            <div className="flex items-center justify-end md:hidden">
              <Suspense fallback={<SortTogglesSkeleton />}>
                <SortToggles />
              </Suspense>
            </div>
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsGrid searchParams={eshopParams} />
            </Suspense>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
