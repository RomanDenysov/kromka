import { GridView } from "@/components/views/grid-view";
import { getDetailedCart } from "@/features/cart/queries";
import { ProductCard } from "@/features/products/components/product-card";
import { getProductsByCategory } from "@/features/products/queries";

const CHECKOUT_UPSELL_CATEGORY = "trvanlive-potraviny";
const CHECKOUT_UPSELL_LIMIT = 4;

export async function CheckoutRecommendations({
  className,
}: {
  className?: string;
}) {
  const items = await getDetailedCart();
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
