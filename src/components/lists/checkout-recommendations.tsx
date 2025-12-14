import { ProductCard } from "@/components/cards/product-card";
import { GridView } from "@/components/views/grid-view";
import type { Product } from "@/lib/queries/products";

type Props = {
  products: Product[];
};

export function CheckoutRecommendations({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="checkout-upsell" className="flex flex-col gap-4">
      <h3 className="font-semibold text-xl tracking-tight" id="checkout-upsell">
        Mohlo by vás tiež zaujať
      </h3>
      <GridView>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </GridView>
    </section>
  );
}
