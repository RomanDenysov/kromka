import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { type ReactNode, Suspense } from "react";
import {
  CategoriesChips,
  CategoriesChipsSkeleton,
} from "@/app/(public)/e-shop/categories-chips";
import { loadEshopParams } from "@/app/(public)/e-shop/eshop-params";
import {
  ProductSearch,
  ProductSearchSkeleton,
} from "@/app/(public)/e-shop/product-search";
import {
  CategoriesSidebar,
  CategoriesSidebarSkeleton,
} from "@/components/filters/categories-sidebar";
import {
  SortToggles,
  SortTogglesSkeleton,
} from "@/components/filters/sort-toggles";
import { PageWrapper } from "@/components/shared/container";
import { getCategoriesByCatalog } from "@/features/categories/api/queries";
import {
  B2BProductsGrid,
  B2BProductsGridSkeleton,
} from "@/features/products/components/b2b-products-grid";
import { requireB2bMember } from "@/lib/auth/guards";
import { defaultMetadata } from "@/lib/metadata";

type Props = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "B2B E-shop",
  description: "B2B katalóg produktov s výhodnými cenami pre vašu organizáciu.",
  robots: { index: false, follow: false },
};

async function B2BAuthCheck({
  children,
}: {
  children: (priceTierId: string | null) => ReactNode;
}) {
  const { priceTierId } = await requireB2bMember();
  return <>{children(priceTierId)}</>;
}

async function B2BShopContent({
  searchParams,
  priceTierId,
}: {
  searchParams: Promise<SearchParams>;
  priceTierId: string | null;
}) {
  const categories = await getCategoriesByCatalog({ catalog: "b2b" });
  const eshopParams = await loadEshopParams(searchParams);

  return (
    <>
      <div className="col-span-full">
        <h1 className="font-bold text-xl lg:text-2xl">B2B E-shop</h1>
        <span className="hidden font-medium text-base text-muted-foreground md:block">
          Výhodné ceny pre vašu organizáciu
        </span>
      </div>
      <Suspense fallback={<CategoriesSidebarSkeleton />}>
        <CategoriesSidebar categories={Promise.resolve(categories)} />
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
          <CategoriesChips categories={Promise.resolve(categories)} />
        </Suspense>
        <div className="flex items-center justify-end md:hidden">
          <Suspense fallback={<SortTogglesSkeleton />}>
            <SortToggles />
          </Suspense>
        </div>
        <Suspense fallback={<B2BProductsGridSkeleton />}>
          <B2BProductsGrid
            priceTierId={priceTierId}
            searchParams={Promise.resolve(eshopParams)}
          />
        </Suspense>
      </div>
    </>
  );
}

export default async function B2BShopPage({ searchParams }: Props) {
  return (
    <PageWrapper className="relative grid min-h-[calc(100svh-5rem)] w-full items-start gap-8 pt-2 md:grid-cols-[12rem_1fr]">
      <Suspense fallback={<div>Loading...</div>}>
        <B2BAuthCheck>
          {(priceTierId) => (
            <B2BShopContent
              priceTierId={priceTierId}
              searchParams={searchParams}
            />
          )}
        </B2BAuthCheck>
      </Suspense>
    </PageWrapper>
  );
}
