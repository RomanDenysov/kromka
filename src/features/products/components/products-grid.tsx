import type { EshopParams } from "@/app/(public)/e-shop/eshop-params";
import { GridView } from "@/components/grid-view";
import { ShowMore } from "@/components/show-more";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { getFavoriteIds } from "@/features/favorites/api/queries";
import { filterProducts } from "@/features/products/filter";
import { getProducts } from "@/features/products/api/queries";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const PRELOAD_LIMIT = 15;

type Props = {
  searchParams: Promise<EshopParams>;
};

export async function ProductsGrid({ searchParams }: Props) {
  const eshopParams = await searchParams;
  const [allProducts, favoriteIds] = await Promise.all([
    getProducts(),
    getFavoriteIds(),
  ]);
  const { products, total } = filterProducts(allProducts, eshopParams);
  const favoriteSet = new Set(favoriteIds);

  return (
    <GridView>
      {total > 0 ? (
        <ShowMore className="col-span-full" initial={12}>
          {products.map((product, index) => (
            <ProductCard
              isFavorite={favoriteSet.has(product.id)}
              key={product.id}
              preload={index < PRELOAD_LIMIT}
              product={product}
            />
          ))}
        </ShowMore>
      ) : (
        <Empty className="col-span-full mt-12 text-center md:mt-20">
          <EmptyTitle>Žiadne výsledky.</EmptyTitle>
          <EmptyDescription>
            Upravte vyhľadávanie alebo kategóriu.
          </EmptyDescription>
        </Empty>
      )}
    </GridView>
  );
}

export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <GridView>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </GridView>
  );
}
