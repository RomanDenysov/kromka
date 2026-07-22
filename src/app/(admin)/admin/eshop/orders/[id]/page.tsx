import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getOrderById } from "@/features/orders/api/queries";
import { getStores } from "@/features/stores/api/queries";
import { OrderDetail } from "./_components/order-detail";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function OrderLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [order, stores] = await Promise.all([
    getOrderById(decodedId),
    getStores(),
  ]);
  return <OrderDetail order={order} stores={stores} />;
}

export default function AdminOrderPage({ params }: Props) {
  return (
    <section className="@container/page h-full flex-1 p-4">
      <Suspense fallback={<FormSkeleton />}>
        <OrderLoader params={params} />
      </Suspense>
    </section>
  );
}
