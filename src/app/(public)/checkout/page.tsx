import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Checkout", href: "/checkout" }]} />
    </PageWrapper>
  );
}
