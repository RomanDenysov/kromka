import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { CheckoutForm } from "./checkout-form";

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Pokladňa", href: "/pokladna" }]} />

      <div className="size-full">
        <div className="@container/summary grid size-full grid-cols-1 gap-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12">
          <section className="size-full p-4 sm:col-span-4 md:col-span-6 lg:col-span-8">
            <h2 className="font-bold text-2xl">Objednávka</h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm">Produkt</span>
                <span className="text-sm">Množstvo</span>
                <span className="text-sm">Cena</span>
              </div>
            </div>
          </section>

          <section className="size-full sm:col-span-3 md:col-span-3 lg:col-span-4">
            <CheckoutForm />
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
