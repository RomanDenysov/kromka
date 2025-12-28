import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { MapPinIcon, PackageIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth/session";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";
import { getUserOrders } from "@/lib/queries/profile";
import { formatPrice } from "@/lib/utils";

const RECENT_ORDER_ITEMS_COUNT = 3;

async function ObjednavkyPageContent() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl">Moje objednávky</h1>
        <p className="text-muted-foreground">
          História všetkých vašich objednávok
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <PackageIcon className="size-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="font-medium">Zatiaľ žiadne objednávky</p>
              <p className="text-muted-foreground text-sm">
                Po vytvorení objednávky sa tu zobrazí.
              </p>
            </div>
            <Link
              className="font-medium text-primary text-sm hover:underline"
              href="/e-shop"
            >
              Prejsť do e-shopu
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Objednávka #{order.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      {format(order.createdAt, "d. MMMM yyyy 'o' HH:mm", {
                        locale: sk,
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      ORDER_STATUS_VARIANTS[order.orderStatus] ?? "default"
                    }
                  >
                    {ORDER_STATUS_LABELS[order.orderStatus] ??
                      order.orderStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Store info */}
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPinIcon className="size-4" />
                    <span>{order.store?.name ?? "Neurčená predajňa"}</span>
                    {order.pickupDate && (
                      <>
                        <span>•</span>
                        <span>
                          Vyzdvihnutie:{" "}
                          {format(order.pickupDate, "d. MMM", { locale: sk })}{" "}
                          {order.pickupTime}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Order items */}
                  <div className="flex flex-col gap-2">
                    {order.items
                      .slice(0, RECENT_ORDER_ITEMS_COUNT)
                      .map((item) => (
                        <div
                          className="flex items-center justify-between text-sm"
                          key={item.productId}
                        >
                          <span>
                            {item.quantity}×{" "}
                            {item.productSnapshot?.name ??
                              item.product?.name ??
                              "Produkt"}
                          </span>
                          <span className="text-muted-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    {order.items.length > RECENT_ORDER_ITEMS_COUNT && (
                      <span className="text-muted-foreground text-sm">
                        +{order.items.length - RECENT_ORDER_ITEMS_COUNT} ďalších
                        položiek
                      </span>
                    )}
                  </div>

                  {/* Total and action */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-semibold">Celkom</span>
                    <span className="font-bold text-lg">
                      {formatPrice(order.totalCents)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ObjednavkyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ObjednavkyPageContent />
    </Suspense>
  );
}
