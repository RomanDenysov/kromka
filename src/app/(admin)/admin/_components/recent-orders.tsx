"use client";

import { RecentOrdersTable } from "@/components/tables/recent-orders/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrentCarts } from "./current-carts";
import type { ActiveCartsData, RecentOrdersData } from "./dashboard-types";

type RecentOrdersProps = {
  orders: RecentOrdersData;
  carts: ActiveCartsData;
};

export function RecentOrders({ orders, carts }: RecentOrdersProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-2">
        <h2 className="font-semibold text-lg tracking-tight">Aktivita</h2>
      </div>
      <Tabs className="w-full" defaultValue="orders">
        <TabsList className="w-full justify-start rounded-none bg-transparent p-0 px-1">
          <TabsTrigger className="flex-0 rounded-sm" value="orders">
            Posledné objednávky ( {orders.length} )
          </TabsTrigger>
          <TabsTrigger className="flex-0 rounded-sm" value="carts">
            Aktuálne košíky ( {carts.length} )
          </TabsTrigger>
        </TabsList>

        <TabsContent className="m-0" value="orders">
          <div className="grow overflow-hidden">
            <RecentOrdersTable orders={orders} />
          </div>
        </TabsContent>

        <TabsContent className="m-0" value="carts">
          <CurrentCarts carts={carts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
