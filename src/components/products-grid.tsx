import type { Product } from "@/lib/queries/products";
import { ProductCard } from "./cards/product-card";
import { Skeleton } from "./ui/skeleton";

const PRELOAD_LIMIT = 15;

type Props = {
  products: Product[];
};

export function ProductsGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.length > 0 ? (
        products.map((product, index) => (
          <ProductCard
            key={product.id}
            preload={index < PRELOAD_LIMIT}
            product={product}
          />
        ))
      ) : (
        <p className="col-span-full text-center text-muted-foreground">
          Žiadne produkty v tejto kategórii
        </p>
      )}
    </div>
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
