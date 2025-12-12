import { Suspense } from "react";
import { CategoriesSidebar } from "@/components/filters/categories-sidebar";
import { SortToggles } from "@/components/filters/sort-toggles";
import { ProductsGrid } from "@/components/products-grid";
import { getCategories } from "@/lib/queries/categories";
import { CategoriesChips } from "./categories-chips";
import { ProductSearch } from "./product-search";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EshopPage({ searchParams }: Props) {
  const categories = getCategories();

  return (
    <div className="flex gap-8">
      <Suspense>
        <CategoriesSidebar categories={categories} />
      </Suspense>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between gap-8">
          <Suspense>
            <ProductSearch />
            <div className="hidden md:block">
              <SortToggles />
            </div>
          </Suspense>
        </div>
        <Suspense>
          <CategoriesChips categories={categories} />
        </Suspense>
        <div className="flex items-center justify-end md:hidden">
          <Suspense>
            <SortToggles />
          </Suspense>
        </div>
        <Suspense>
          <ProductsGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
