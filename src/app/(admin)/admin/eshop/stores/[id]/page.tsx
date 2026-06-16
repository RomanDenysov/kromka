import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getProfitabilitySummary } from "@/features/reports/api/queries";
import {
  ProfitabilityKpis,
  ProfitabilityKpisSkeleton,
} from "@/features/reports/components/profitability-kpis";
import { resolvePeriod } from "@/features/reports/lib/period";
import { getAdminStoreById } from "@/features/stores/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { StoreFormContainer } from "./_components/store-form-container";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function StoreLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const store = await getAdminStoreById(decodedId);
  if (!store) {
    notFound();
  }
  return <StoreFormContainer store={store} />;
}

async function StoreProfitabilityStrip({ params }: Props) {
  const { id } = await params;
  const summary = await getProfitabilitySummary(resolvePeriod("30d"), {
    storeIds: [decodeURIComponent(id)],
  });
  return (
    <div className="space-y-2">
      <p className="font-medium text-muted-foreground text-xs">
        Ziskovosť · posledných 30 dní
      </p>
      <ProfitabilityKpis summary={summary} />
    </div>
  );
}

export default function StorePage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "E-shop", href: "/admin/eshop" },
          { label: "Obchody", href: "/admin/eshop/stores" },
          { label: "Upraviť obchod" },
        ]}
      />
      <section className="@container/page h-full flex-1 space-y-6 p-4">
        <Suspense fallback={<ProfitabilityKpisSkeleton />}>
          <StoreProfitabilityStrip params={params} />
        </Suspense>
        <Suspense
          fallback={
            <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
          }
        >
          <StoreLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
