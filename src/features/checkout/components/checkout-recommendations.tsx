import { GridView } from "@/components/views/grid-view";
import { ProductCard } from "@/features/products/components/product-card";
import { getProductsByCategory } from "@/features/products/queries";

const CHECKOUT_UPSELL_CATEGORY = "trvanlive-potraviny";
const CHECKOUT_UPSELL_LIMIT = 4;

type CheckoutRecommendationsProps = {
  cartProductIds: Set<string>;
  className?: string;
};

/**
 * Displays product recommendations at checkout.
 * Receives cart product IDs as props to avoid duplicate cart fetching.
 */
export async function CheckoutRecommendations({
  cartProductIds,
  className,
}: CheckoutRecommendationsProps) {
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
