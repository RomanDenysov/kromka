"use client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import type { RecentOrder } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";

type ProductAggregate = {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
};

type Props = {
  orders: RecentOrder[];
  products: ProductAggregate[];
};

export function DashboardRecentTabs({ orders, products }: Props) {
  const [{ date, tab }, setSearchParams] = useDashboardParams();
  return (
    <Card className="size-full">
      <Tabs
        onValueChange={(value) =>
          setSearchParams({ tab: value as "orders" | "products" })
        }
        value={tab}
      >
        <CardHeader>
          <CardTitle>{format(date, "EEEE d. MMMM yyyy")}</CardTitle>
          <TabsList>
            <TabsTrigger value="orders">
              Objednávky ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Produkty ({products.length})
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="orders">
            <OrdersList orders={orders} />
          </TabsContent>
          <TabsContent value="products">
            <ProductsAggregate products={products} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

function OrdersList({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Žiadne objednávky na tento deň.
      </p>
    );
  }

  return (
    <div className="max-h-[400px] space-y-2 overflow-auto">
      {orders.map((order) => (
        <div className="rounded-lg border p-3" key={order.id}>
          <div className="flex items-center justify-between">
            <span className="font-medium">#{order.orderNumber}</span>
            <span className="text-sm">{formatPrice(order.totalCents)}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {order.store?.name} • {order.pickupTime}
          </div>
          <div className="mt-2 text-xs">
            {order.items.map((item) => (
              <span className="mr-2" key={item.productId}>
                {item.product.name} ×{item.quantity}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsAggregate({ products }: { products: ProductAggregate[] }) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Žiadne produkty na tento deň.
      </p>
    );
  }

  const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);

  return (
    <div className="space-y-2">
      <div className="mb-4 font-medium text-sm">Celkom: {totalQuantity} ks</div>
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
