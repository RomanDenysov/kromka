import { loadEshopParams } from "@/app/(public)/e-shop/eshop-params";
import { filterProducts } from "@/lib/products/filter";
import { getProducts } from "@/lib/queries/products";
import { ProductCard } from "./cards/product-card";
import { ShowMore } from "./show-more";
import { Empty, EmptyDescription, EmptyTitle } from "./ui/empty";
import { Skeleton } from "./ui/skeleton";
import { GridView } from "./views/grid-view";

const PRELOAD_LIMIT = 15;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function ProductsGrid({ searchParams }: Props) {
  const eshopParams = await loadEshopParams(searchParams);
  const allProducts = await getProducts();
  const { products, total } = filterProducts(allProducts, eshopParams);
  return (
    <GridView>
      {total > 0 ? (
        <ShowMore className="col-span-full" initial={12}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              preload={index < PRELOAD_LIMIT}
              product={product}
            />
          ))}
        </ShowMore>
      ) : (
        <Empty className="col-span-full mt-12 text-center">
          <EmptyTitle>Žiadne výsledky.</EmptyTitle>
          <EmptyDescription>
            Upravte vyhľadávanie alebo kategóriu.
          </EmptyDescription>
        </Empty>
      )}
    </GridView>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-md p-0.5">
      <div className="aspect-square w-full rounded-md">
        <Skeleton className="size-full" />
      </div>
      <div className="flex size-full flex-col justify-between gap-2 px-1 pb-1">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}
