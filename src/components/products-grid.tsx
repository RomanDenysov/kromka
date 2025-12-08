import type { Product } from "@/lib/queries/products";
import { ProductCard } from "./cards/product-card";
import { ProductCardSkeleton } from "./cards/product-card-skeleton";

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

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}
