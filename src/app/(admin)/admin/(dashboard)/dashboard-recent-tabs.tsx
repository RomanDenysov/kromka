"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { ArrowUpRightFromSquareIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecentOrder } from "@/features/admin-dashboard/api/queries";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

interface ProductAggregate {
  orderCount: number;
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface Props {
  orders: RecentOrder[];
  products: ProductAggregate[];
}

export function DashboardRecentTabs({ orders, products }: Props) {
  const [{ date, tab }, setSearchParams] = useDashboardParams();
  return (
    <Tabs
      className="flex-1"
      onValueChange={(value) =>
        setSearchParams({ tab: value as "orders" | "products" })
      }
      value={tab}
    >
      <div className="gap-4 p-2">
        <div className="flex items-center justify-between gap-2 p-1">
          <h3 className="font-medium text-lg capitalize">
            {format(date, "d. EEEE ", { locale: sk })}
          </h3>
          <Link
            className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
            href={`/admin/eshop/orders?date=${date}`}
          >
            Všetky
            <ChevronRightIcon />
          </Link>
        </div>
        <TabsList className="h-fit w-full rounded-none bg-transparent">
          <TabsTrigger className="h-6 text-xs" value="orders">
            Objednávky ({orders.length})
          </TabsTrigger>
          <TabsTrigger className="h-6 text-xs" value="products">
            Produkty ({products.length})
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="h-full grow overflow-hidden">
        <TabsContent value="orders">
          <OrdersList orders={orders} />
        </TabsContent>
        <TabsContent value="products">
          <ProductsAggregate products={products} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function OrdersList({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">
          Žiadne objednávky na tento deň.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] space-y-2 overflow-auto">
      {orders.map((order) => (
        <div className="rounded-lg border p-3" key={order.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">#{order.orderNumber}</span>
              <Badge
                size="xs"
                variant={ORDER_STATUS_VARIANTS[order.orderStatus]}
              >
                {ORDER_STATUS_LABELS[order.orderStatus]}
              </Badge>
            </div>
            <span className="text-sm">{formatPrice(order.totalCents)}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {order.store?.name} • {order.pickupTime}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs">
              {order.items.map((item) => (
                <span className="mr-2" key={item.productId}>
                  {item.product.name} ×{item.quantity}
                </span>
              ))}
            </div>
            <Link href={`/admin/eshop/orders/${order.id}`}>
              <ArrowUpRightFromSquareIcon className="size-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsAggregate({ products }: { products: ProductAggregate[] }) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">
          Žiadne produkty na tento deň.
        </p>
      </div>
    );
  }

  const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-medium text-sm">Celkom: {totalQuantity} ks</div>
      </div>
      <div className="max-h-[400px] space-y-1 overflow-auto">
        {products.map((product) => (
          <div
            className="flex items-center justify-between border-b py-2"
            key={product.productId}
          >
            <div>
              <span className="font-medium">{product.productName}</span>
              <span className="ml-2 text-muted-foreground text-xs">
                ({product.orderCount} obj.)
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold">{product.totalQuantity} ks</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {formatPrice(product.totalRevenue)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
