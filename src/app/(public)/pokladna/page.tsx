import type { Metadata } from "next";
import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getCartTotals, getDetailedCart } from "@/features/cart/queries";
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
import { getUserDetails } from "@/lib/auth/session";
import { getSiteConfig } from "@/lib/site-config/queries";

export const metadata: Metadata = {
  title: "Pokladňa",
  description: "Dokončite vašu objednávku v Pekárni Kromka.",
  robots: { index: false, follow: false },
};

/**
 * Single data loader that fetches all required data in parallel.
 * This avoids the previous issue of fetching cart 4 times.
 */
async function CheckoutDataLoader() {
  const [user, items, stores, ordersEnabled] = await Promise.all([
    getUserDetails(),
    getDetailedCart(),
    getStores(),
    getSiteConfig("orders_enabled"),
  ]);

  const totals = getCartTotals(items);
  const cartProductIds = new Set(items.map((item) => item.productId));

  return (
    <>
      <div className="col-span-full">
        <CheckoutCartHeader totals={totals} />
      </div>
      <section className="size-full md:col-span-5 lg:col-span-7">
        <CheckoutList items={items} totals={totals} />
      </section>

      <section className="size-full md:col-span-4 lg:col-span-5">
        <CheckoutForm
          items={items}
          ordersEnabled={ordersEnabled}
          stores={stores}
          user={user}
        />
      </section>

      <CheckoutRecommendations
        cartProductIds={cartProductIds}
        className="col-span-full flex size-full flex-col gap-4"
      />
    </>
  );
}

function CheckoutCartHeaderSkeleton() {
  return <Skeleton className="h-7 w-32" />;
}

function CheckoutRecommendationsSkeleton() {
  return (
    <section className="col-span-full flex size-full flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="aspect-square w-full rounded-lg" />
      </div>
    </section>
  );
}

function CheckoutDataLoaderSkeleton() {
  return (
    <>
      <div className="col-span-full">
        <CheckoutCartHeaderSkeleton />
      </div>
      <section className="size-full md:col-span-5 lg:col-span-7">
        <CheckoutListSkeleton />
      </section>
      <section className="size-full md:col-span-4 lg:col-span-5">
        <CheckoutFormSkeleton />
      </section>
      <CheckoutRecommendationsSkeleton />
    </>
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
      <div className="@container/summary grid size-full grid-cols-1 gap-5 md:grid-cols-9 lg:grid-cols-12">
        <Suspense fallback={<CheckoutDataLoaderSkeleton />}>
          <CheckoutDataLoader />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
