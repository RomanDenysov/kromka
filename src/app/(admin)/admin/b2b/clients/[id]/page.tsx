import type { Route } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { B2BClientDetail } from "@/components/b2b/client-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizationById } from "@/features/b2b/clients/api/queries";
import { getPriceTiers } from "@/features/b2b/price-tiers/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function ClientDetailLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [organization, priceTiers] = await Promise.all([
    getOrganizationById(decodedId),
    getPriceTiers(),
  ]);

  if (!organization) {
    notFound();
  }

  return (
    <B2BClientDetail organization={organization} priceTiers={priceTiers} />
  );
}

export default function B2BClientDetailPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Klienti", href: "/admin/b2b/clients" as Route },
          { label: "Detail klienta" },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          }
        >
          <ClientDetailLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
