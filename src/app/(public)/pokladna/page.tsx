import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { getUserDetails } from "@/features/auth/session";
import { getDetailedCart } from "@/features/cart/queries";
import { CheckoutCartHeader } from "@/features/checkout/components/checkout-cart-header";
import {
  CheckoutForm,
  CheckoutFormSkeleton,
} from "@/features/checkout/components/checkout-form";
import {
  CheckoutList,
  CheckoutListSkeleton,
} from "@/features/checkout/components/checkout-list";
import { CheckoutRecommendations } from "@/features/checkout/components/checkout-recommendations";
import { getStores } from "@/features/stores/queries";
import { getSiteConfig } from "@/lib/site-config/queries";

async function CheckoutFormLoader() {
  const [user, items, stores, ordersEnabled] = await Promise.all([
    getUserDetails(),
    getDetailedCart(),
    getStores(),
    getSiteConfig("orders_enabled"),
  ]);

  return (
    <CheckoutForm
      items={items}
      ordersEnabled={ordersEnabled}
      stores={stores}
      user={user}
    />
  );
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
        <div className="col-span-full">
          <CheckoutCartHeader />
        </div>
        <section className="size-full sm:col-span-4 md:col-span-6 lg:col-span-8">
          <Suspense fallback={<CheckoutListSkeleton />}>
            <CheckoutList />
          </Suspense>
        </section>

        <section className="size-full sm:col-span-3 md:col-span-3 lg:col-span-4">
          <Suspense fallback={<CheckoutFormSkeleton />}>
            <CheckoutFormLoader />
          </Suspense>
        </section>

        {/* Recommendations after form on mobile only (below sm breakpoint) */}
        <Suspense>
          <CheckoutRecommendations className="col-span-full flex size-full flex-col gap-4" />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
