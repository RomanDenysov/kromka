import { ArrowUpRightFromSquareIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { RecentOrder } from "@/features/admin-dashboard/api/queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function SidebarOrdersList({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">
          Žiadne objednávky na tento deň.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div className="rounded-md border p-2.5" key={order.id}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-medium font-mono text-sm">
                #{order.orderNumber}
              </span>
              <Badge
                size="xs"
                variant={ORDER_STATUS_VARIANTS[order.orderStatus]}
              >
                {ORDER_STATUS_LABELS[order.orderStatus]}
              </Badge>
            </div>
            <span className="shrink-0 text-sm">
              {formatPrice(order.totalCents)}
            </span>
          </div>
          <div className="truncate text-muted-foreground text-xs">
            {order.store?.name} · {order.pickupTime}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="line-clamp-2 min-w-0 text-xs">
              {order.items.map((item) => (
                <span className="mr-2" key={item.productId}>
                  {item.product.name} ×{item.quantity}
                </span>
              ))}
            </p>
            <Link
              className="shrink-0 text-muted-foreground hover:text-foreground"
              href={`/admin/eshop/orders/${order.id}`}
            >
              <ArrowUpRightFromSquareIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
