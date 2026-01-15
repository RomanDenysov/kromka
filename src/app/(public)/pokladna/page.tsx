import { ChevronLeftIcon, ShoppingCartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getCartTotals, getDetailedCart } from "@/features/cart/queries";
import { getLastOrderPrefillAction } from "@/features/checkout/actions";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { CheckoutList } from "@/features/checkout/components/checkout-list";
import { CheckoutListItem } from "@/features/checkout/components/checkout-list-item";
import { CheckoutRecommendations } from "@/features/checkout/components/checkout-recommendations";
import { getStores } from "@/features/stores/queries";
import { getUserDetails } from "@/lib/auth/session";
import { getItemCountString } from "@/lib/item-count-string";
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
  const user = await getUserDetails();
  const [items, stores, ordersEnabled, lastOrderPrefill] = await Promise.all([
    getDetailedCart(),
    getStores(),
    getSiteConfig("orders_enabled"),
    getLastOrderPrefillAction(user?.id),
  ]);

  const totals = getCartTotals(items);

  return (
    <>
      <div className="col-span-full ">
         <h1 className="font-bold text-xl lg:text-2xl">Vaša objednávka</h1>
        <span className="hidden md:block text-muted-foreground text-base font-medium">
          Košík ({getItemCountString(totals.totalQuantity)})
        </span>
      </div>
      <section className="size-full md:col-span-5 lg:col-span-7">
        {items.length > 0 ? (
          <CheckoutList totals={totals}>
            <div className="mt-2 flex flex-col gap-2 md:mt-0">
              {items.map((item) => (
                <CheckoutListItem item={item} key={item.productId} />
              ))}
            </div>
          </CheckoutList>
        ) : (
          <center className="flex w-full items-start justify-center rounded-sm border border-dashed py-20">
            <Empty className="flex flex-col gap-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingCartIcon />
                </EmptyMedia>
                <EmptyTitle className="lg:text-2xl">
                  Vaše košík je prázdny.
                </EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Link className={buttonVariants()} href="/e-shop">
                  <ChevronLeftIcon />
                  Pokračovať v nákupe
                </Link>
              </EmptyContent>
            </Empty>
          </center>
        )}
      </section>

      <section className="size-full md:col-span-4 lg:col-span-5">
        <CheckoutForm
          items={items}
          lastOrderPrefill={lastOrderPrefill}
          ordersEnabled={ordersEnabled}
          stores={stores}
          user={user}
        />
      </section>

      <CheckoutRecommendations
        className="col-span-full flex size-full flex-col gap-4"
        items={items}
      />
    </>
  );
}

function CheckoutDataLoaderSkeleton() {
  return (
    <>
      <div className="col-span-full">
        <Skeleton className="h-7 w-32" />
      </div>
      <section className="size-full md:col-span-5 lg:col-span-7">
        <div className="hidden flex-col gap-4 md:flex">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="flex size-full min-h-24 flex-row gap-3 rounded-sm border p-3"
                key={`skeleton-${index.toString()}`}
              >
                <Skeleton className="size-[120px] rounded-sm" />
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="size-7 rounded" />
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-7 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="block h-20 w-full md:hidden" />
      </section>
      <section className="size-full md:col-span-4 lg:col-span-5">
        <div className="grid grid-cols-1 gap-5">
          <Skeleton className="h-70 w-full" />
          <Skeleton className="h-50 w-full" />
          <Skeleton className="h-50 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
      <section className="col-span-full flex size-full flex-col gap-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
      </section>
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
     
      <div className="@container/summary grid size-full grid-cols-1 gap-5 md:grid-cols-9 lg:grid-cols-12">
        <Suspense fallback={<CheckoutDataLoaderSkeleton />}>
          <CheckoutDataLoader />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
