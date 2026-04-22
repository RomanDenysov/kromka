import type { EshopParams } from "@/app/(public)/(pages)/e-shop/eshop-params";
import { GridView } from "@/components/grid-view";
import { ShowMore } from "@/components/show-more";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { getProducts } from "@/features/products/api/queries";
import { filterProducts } from "@/features/products/filter";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const PRELOAD_LIMIT = 15;

interface Props {
  searchParams: Promise<EshopParams>;
}

export async function ProductsGrid({ searchParams }: Props) {
  const eshopParams = await searchParams;
  const allProducts = await getProducts();
  const { products, total } = filterProducts(allProducts, eshopParams);

  return (
    <GridView>
      {total > 0 ? (
        <ShowMore className="col-span-full" initial={30}>
          {products.map((product, index) => (
            <div
              key={product.id}
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "0 350px",
              }}
            >
              <ProductCard preload={index < PRELOAD_LIMIT} product={product} />
            </div>
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
