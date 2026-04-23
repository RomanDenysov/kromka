import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "@/features/orders/components/order-actions";
import { OrderAutoRefresh } from "@/features/orders/components/order-auto-refresh";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { getStores } from "@/features/stores/api/queries";
import { getUserOrderById } from "@/features/user-profile/api/queries";
import { getUser } from "@/lib/auth/session";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detail objednávky",
  description: "Detail vašej objednávky v Pekárni Kromka.",
  robots: { index: false, follow: false },
};

async function OrderDetailContent({ orderId }: { orderId: string }) {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const [order, stores] = await Promise.all([
    getUserOrderById(user.id, orderId),
    getStores(),
  ]);

  if (!order) {
    notFound();
  }

  const subtotalCents = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <OrderAutoRefresh orderStatus={order.orderStatus}>
      <div className="flex flex-col gap-6">
        {/* Back link + Header */}
        <div className="flex flex-col gap-3">
          <Link
            className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
            href="/profil/objednavky"
          >
            <ArrowLeftIcon className="size-4" />
            Späť na objednávky
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bold text-2xl">
                Objednávka #{order.orderNumber}
              </h1>
              <p className="text-muted-foreground text-sm">
                {format(order.createdAt, "d. MMMM yyyy 'o' HH:mm", {
                  locale: sk,
                })}
              </p>
            </div>
            <Badge
              className="w-fit"
              variant={ORDER_STATUS_VARIANTS[order.orderStatus] ?? "default"}
            >
              {ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <OrderActions
          currentPickupDate={order.pickupDate}
          currentPickupTime={order.pickupTime}
          currentStoreId={order.storeId}
          orderId={order.id}
          orderStatus={order.orderStatus}
          stores={stores}
        />

        {/* Pickup info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vyzdvihnutie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                <span>{order.store?.name ?? "Neurčená predajňa"}</span>
              </div>
              {order.pickupDate && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {format(order.pickupDate, "d. MMMM yyyy", { locale: sk })}
                  </span>
                </div>
              )}
              {order.pickupTime && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span>{order.pickupTime}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Položky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {order.items.map((item) => (
                <div
                  className="flex items-center justify-between text-sm"
                  key={item.productId}
                >
                  <span>
                    {item.quantity}x{" "}
                    {item.productSnapshot?.name ??
                      item.product?.name ??
                      "Produkt"}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <Separator className="my-1" />

              {order.discountCents > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Medzisúčet</span>
                  <span>{formatPrice(subtotalCents)}</span>
                </div>
              )}
              {order.discountCents > 0 && (
                <div className="flex items-center justify-between text-green-600 text-sm">
                  <span>Zľava</span>
                  <span>-{formatPrice(order.discountCents)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold">Celkom</span>
                <span className="font-bold text-lg">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status timeline */}
        <Card>
          <CardContent className="pt-6">
            <OrderStatusTimeline events={order.statusEvents} />
          </CardContent>
        </Card>
      </div>
    </OrderAutoRefresh>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
      }
    >
      <OrderDetailWrapper params={params} />
    </Suspense>
  );
}

async function OrderDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
