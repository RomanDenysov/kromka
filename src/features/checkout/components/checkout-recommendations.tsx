import { GridView } from "@/components/grid-view";
import type { DetailedCartItem } from "@/features/cart/api/queries";
import { getProductsByCategory } from "@/features/products/api/queries";
import { ProductCard } from "@/features/products/components/product-card";

const CHECKOUT_UPSELL_CATEGORY = "trvanlive-potraviny";
const CHECKOUT_UPSELL_LIMIT = 4;

type CheckoutRecommendationsProps = {
  items: DetailedCartItem[];
  className?: string;
};

/**
 * Displays product recommendations at checkout.
 * Receives cart product IDs as props to avoid duplicate cart fetching.
 */
export async function CheckoutRecommendations({
  items,
  className,
}: CheckoutRecommendationsProps) {
  const cartProductIds = new Set(items.map((item) => item.productId));
  const categoryProducts = await getProductsByCategory(
    CHECKOUT_UPSELL_CATEGORY
  );
  const products =
    categoryProducts
      ?.filter((p) => p.status === "active" && !cartProductIds.has(p.id))
      .slice(0, CHECKOUT_UPSELL_LIMIT) ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="checkout-upsell" className={className}>
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
