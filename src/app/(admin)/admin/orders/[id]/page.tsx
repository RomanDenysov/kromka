import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { OrderDetail } from "./_components/order-detail";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderPage({ params }: Props) {
  const { id } = await params;

  prefetch(trpc.admin.orders.byId.queryOptions({ id }));

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Objednávky", href: "/admin/orders" },
          { label: "Detail objednávky" },
        ]}
      />
      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="@container/page h-full flex-1 p-4">
          <Suspense fallback={<FormSkeleton />}>
            <OrderDetail orderId={id} />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
