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
import { PageWrapper } from "@/components/shared/container";
import { getCategories } from "@/features/categories/api/queries";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "@/features/products/components/products-grid";
import { defaultMetadata } from "@/lib/metadata";
import { getCollectionPageSchema } from "@/lib/seo/json-ld";
import { CategoriesChips, CategoriesChipsSkeleton } from "./categories-chips";
import { loadEshopParams } from "./eshop-params";
import { ProductSearch, ProductSearchSkeleton } from "./product-search";

type Props = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Naše Produkty",
  description:
    "Objavte širokú ponuku tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý domáci chlieb, pečivo, koláče a iné špeciality pečené s láskou a podľa tradičných receptov. Nakupujte online.",
  openGraph: {
    title: "Naše Produkty",
    description:
      "Objavte širokú ponuku tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý domáci chlieb, pečivo, koláče a iné špeciality pečené s láskou a podľa tradičných receptov. Nakupujte online.",
    images: [
      {
        url: "/images/kromka-vianoce-hero-min.webp",
        width: 1200,
        height: 630,
        alt: "Ponuka pekárenských výrobkov Pekárne Kromka",
      },
    ],
  },
};

export default function EshopPage({ searchParams }: Props) {
  const categoriesPromise = getCategories();
  const eshopParams = loadEshopParams(searchParams);

  return (
    <>
      <JsonLd data={[getCollectionPageSchema()]} />
      <PageWrapper className="relative grid min-h-[calc(100svh-5rem)] w-full items-start gap-8 pt-2 md:grid-cols-[12rem_1fr]">
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
      </PageWrapper>
    </>
  );
}
