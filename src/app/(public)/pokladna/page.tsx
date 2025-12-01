import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { CheckoutForm } from "./checkout-form";

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Pokladňa", href: "/pokladna" }]} />

      <div className="size-full">
        <div className="grid size-full grid-cols-12 gap-5">
          <section className="col-span-8 size-full p-4">
            <h2 className="font-bold text-2xl">Objednávka</h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm">Produkt</span>
                <span className="text-sm">Množstvo</span>
                <span className="text-sm">Cena</span>
              </div>
            </div>
          </section>

          <section className="col-span-4 size-full">
            <CheckoutForm />
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
