import { ChevronLeftIcon, ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
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
import {
  getCartTotals,
  getDetailedB2bCart,
} from "@/features/cart/api/queries";
import { B2bCheckoutForm } from "@/features/checkout/components/b2b-checkout-form";
import { CheckoutList } from "@/features/checkout/components/checkout-list";
import { CheckoutListItem } from "@/features/checkout/components/checkout-list-item";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { requireB2bMember } from "@/lib/auth/guards";
import { getItemCountString } from "@/lib/item-count-string";

export const metadata: Metadata = {
  title: "B2B Pokladňa",
  description: "Dokončite vašu B2B objednávku v Pekárni Kromka.",
  robots: { index: false, follow: false },
};

async function B2bCheckoutDataLoader() {
  const { user, organization, priceTierId } = await requireB2bMember();
  const [items, ordersEnabled] = await Promise.all([
    getDetailedB2bCart(priceTierId),
    getSiteConfig("orders_enabled"),
  ]);

  const totals = getCartTotals(items);

  return (
    <>
      <div className="col-span-full">
        <h1 className="font-bold text-xl lg:text-2xl">B2B Objednávka</h1>
        <span className="hidden font-medium text-base text-muted-foreground md:block">
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
                  Váš B2B košík je prázdny.
                </EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Link className={buttonVariants()} href="/b2b/shop">
                  <ChevronLeftIcon />
                  Pokračovať v nákupe
                </Link>
              </EmptyContent>
            </Empty>
          </center>
        )}
      </section>

      <section className="size-full md:col-span-4 lg:col-span-5">
        <B2bCheckoutForm
          contactEmail={user?.email ?? ""}
          contactPhone={user?.phone ?? ""}
          items={items}
          ordersEnabled={ordersEnabled}
          org={{
            id: organization.id,
            name: organization.name,
            billingName: organization.billingName,
            ico: organization.ico,
            dic: organization.dic,
            icDph: organization.icDph,
            billingEmail: organization.billingEmail,
            billingAddress: organization.billingAddress,
          }}
        />
      </section>
    </>
  );
}

function B2bCheckoutDataLoaderSkeleton() {
  return (
    <>
      <div className="col-span-full">
        <Skeleton className="h-7 w-32" />
      </div>
      <section className="size-full md:col-span-5 lg:col-span-7">
        <Skeleton className="h-60 w-full" />
      </section>
      <section className="size-full md:col-span-4 lg:col-span-5">
        <div className="grid grid-cols-1 gap-5">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-30 w-full" />
          <Skeleton className="h-30 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    </>
  );
}

export default function B2bCheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "B2B E-shop", href: "/b2b/shop" as Route },
          { label: "Pokladňa", href: "/b2b/pokladna" as Route },
        ]}
      />

      <div className="@container/summary grid size-full grid-cols-1 gap-5 md:grid-cols-9 lg:grid-cols-12">
        <Suspense fallback={<B2bCheckoutDataLoaderSkeleton />}>
          <B2bCheckoutDataLoader />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
