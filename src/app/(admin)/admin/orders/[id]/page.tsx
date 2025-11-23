import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

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
      <section className="h-full flex-1 p-4">
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* <OrderDetail orderId={orderId} /> */}
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrateClient>
  );
}
