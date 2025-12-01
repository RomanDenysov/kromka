import { CheckoutList } from "@/components/lists/checkout-list";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { CheckoutForm } from "./checkout-form";

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Pokladňa", href: "/pokladna" }]} />
      <h2 className="font-bold text-2xl">Objednávka</h2>
      <div className="@container/summary grid size-full grid-cols-1 gap-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12">
        <section className="size-full sm:col-span-4 md:col-span-6 lg:col-span-8">
          <CheckoutList />
        </section>

        <section className="size-full sm:col-span-3 md:col-span-3 lg:col-span-4">
          <CheckoutForm />
        </section>
      </div>
    </PageWrapper>
  );
}
