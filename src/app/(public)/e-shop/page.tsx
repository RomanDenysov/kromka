import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CategoriesSidebar,
  CategoriesSidebarSkeleton,
} from "@/components/filters/categories-sidebar";
import {
  SortToggles,
  SortTogglesSkeleton,
} from "@/components/filters/sort-toggles";
import { ProductsGrid } from "@/components/products-grid";
import { PageWrapper } from "@/components/shared/container";
import { defaultMetadata } from "@/lib/metadata";
import { getCategories } from "@/lib/queries/categories";
import { CategoriesChips, CategoriesChipsSkeleton } from "./categories-chips";
import { ProductSearch, ProductSearchSkeleton } from "./product-search";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
        alt: "Vianočná ponuka Pekárne Kromka",
      },
    ],
  },
};

export default function EshopPage({ searchParams }: Props) {
  const categories = getCategories();

  return (
    <PageWrapper className="relative grid min-h-[calc(100svh-5rem)] w-full items-start gap-8 pt-2 md:grid-cols-[12rem_1fr]">
      <Suspense fallback={<CategoriesSidebarSkeleton />}>
        <CategoriesSidebar categories={categories} />
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
          <CategoriesChips categories={categories} />
        </Suspense>
        <div className="flex items-center justify-end md:hidden">
          <Suspense fallback={<SortTogglesSkeleton />}>
            <SortToggles />
          </Suspense>
        </div>
        <Suspense>
          <ProductsGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
