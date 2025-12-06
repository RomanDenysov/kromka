import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetail } from "./_components/order-detail";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function AdminOrderPageContent({ params }: Props) {
  const { id } = await params;

  const fetchedOrder = await getOrderById(id);

  if (!fetchedOrder) {
    notFound();
  }

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
          <OrderDetail order={fetchedOrder} />
        </Suspense>
      </section>
    </>
  );
}

export default function AdminOrderPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AdminOrderPageContent params={params} />
    </Suspense>
  );
}
