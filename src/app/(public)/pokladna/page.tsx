import { Suspense } from "react";
import {
  CheckoutList,
  CheckoutListSkeleton,
} from "@/components/lists/checkout-list";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { getAuth } from "@/lib/auth/session";
import { getStores } from "@/lib/queries/stores";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const { user } = await getAuth();
  const stores = await getStores();
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
          <CheckoutForm stores={stores} user={user} />
        </section>
      </div>
    </PageWrapper>
  );
}
