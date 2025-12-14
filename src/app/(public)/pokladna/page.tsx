import { Suspense } from "react";
import {
  CheckoutList,
  CheckoutListSkeleton,
} from "@/components/lists/checkout-list";
import { CheckoutRecommendations } from "@/components/lists/checkout-recommendations";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { getDetailedCart } from "@/lib/cart/queries";
import { getProductsByCategory } from "@/lib/queries/products";
import { CheckoutFormSkeleton } from "./checkout-form";
import { CheckoutFormContainer } from "./checkout-form-container";

const CHECKOUT_UPSELL_CATEGORY = "trvanlive-potraviny";
const CHECKOUT_UPSELL_LIMIT = 4;

async function CheckoutRecommendationsServer() {
  const items = await getDetailedCart();
  const cartProductIds = new Set(items.map((item) => item.productId));

  const categoryProducts = await getProductsByCategory(
    CHECKOUT_UPSELL_CATEGORY
  );
  const upsellProducts =
    categoryProducts
      ?.filter((p) => p.status === "active" && !cartProductIds.has(p.id))
      .slice(0, CHECKOUT_UPSELL_LIMIT) ?? [];

  return <CheckoutRecommendations products={upsellProducts ?? []} />;
}

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "E-shop", href: "/e-shop" },
          { label: "Pokladňa", href: "/pokladna" },
        ]}
      />
      <h2 className="font-bold text-2xl">Vaša objednávka</h2>
      <div className="@container/summary grid size-full grid-cols-1 gap-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12">
        <section className="size-full sm:col-span-4 md:col-span-6 lg:col-span-8">
          <Suspense fallback={<CheckoutListSkeleton />}>
            <CheckoutList />
          </Suspense>
        </section>

        <section className="size-full sm:col-span-3 md:col-span-3 lg:col-span-4">
          <Suspense fallback={<CheckoutFormSkeleton />}>
            <CheckoutFormContainer />
          </Suspense>
        </section>

        {/* Recommendations after form on mobile only (below sm breakpoint) */}
        <section className="size-full sm:hidden">
          <Suspense>
            <CheckoutRecommendationsServer />
          </Suspense>
        </section>
      </div>
    </PageWrapper>
  );
}
