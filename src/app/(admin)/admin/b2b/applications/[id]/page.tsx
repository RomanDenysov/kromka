import type { Route } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { B2BApplicationDetail } from "@/components/b2b/application-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { getB2bApplicationById } from "@/features/b2b/applications/api/queries";
import { getPriceTiers } from "@/features/b2b/price-tiers/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function ApplicationDetailLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [application, priceTiers] = await Promise.all([
    getB2bApplicationById(decodedId),
    getPriceTiers(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <B2BApplicationDetail application={application} priceTiers={priceTiers} />
  );
}

export default function B2BApplicationDetailPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Žiadosti", href: "/admin/b2b/applications" as Route },
          { label: "Detail žiadosti" },
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
          <ApplicationDetailLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
