import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { CheckCircleIcon } from "lucide-react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatPrice } from "@/lib/utils";

async function getOrderById(orderId: string) {
  "use cache";
  cacheLife("minutes");
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      store: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });
}

async function OrderConfirmationPageContent({ orderId }: { orderId: string }) {
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto flex flex-col items-center gap-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <CheckCircleIcon className="size-16 text-green-500" />
        <h1 className="font-bold text-2xl">Ďakujeme za objednávku!</h1>
        <p className="text-muted-foreground">
          Číslo objednávky: <strong>{order.orderNumber}</strong>
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Miesto vyzdvihnutia</h2>
          <p>{order.store?.name}</p>
          <p className="text-muted-foreground text-sm">
            {order.pickupDate
              ? format(order.pickupDate, "d. MMMM yyyy", { locale: sk })
              : "Neurčený"}{" "}
            o {order.pickupTime ? order.pickupTime : "Neurčený"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Položky</h2>
          {order.items.map((item) => (
            <div className="flex justify-between py-1" key={item.productId}>
              <span>
                {item.quantity}× {item.productSnapshot?.name}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Spolu</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <Suspense
      fallback={<div className="container mx-auto py-12">Loading...</div>}
    >
      <OrderConfirmationPageContent orderId={orderId} />
    </Suspense>
  );
}
