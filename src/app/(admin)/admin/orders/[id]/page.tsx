import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getOrderById } from "@/features/orders/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { OrderDetail } from "./_components/order-detail";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function OrderLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const order = await getOrderById(decodedId);
  return <OrderDetail order={order} />;
}

export default function AdminOrderPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Objednávky", href: "/admin/orders" },
          { label: "Detail objednávky" },
        ]}
      />
      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<FormSkeleton />}>
          <OrderLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
