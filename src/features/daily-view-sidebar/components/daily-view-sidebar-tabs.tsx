"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActivityEntry } from "@/features/activity-log/api/queries";
import { ActivityFeed } from "@/features/activity-log/components/activity-feed";
import type { RecentOrder } from "@/features/admin-dashboard/api/queries";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { cn } from "@/lib/utils";
import { SidebarOrdersList } from "./sidebar-orders-list";

interface DailyViewSidebarTabsProps {
  activity: ActivityEntry[];
  date: Date;
  orders: RecentOrder[];
}

export function DailyViewSidebarTabs({
  orders,
  activity,
  date,
}: DailyViewSidebarTabsProps) {
  const [{ sidebarTab }, setSearchParams] = useDashboardParams();

  return (
    <Tabs
      className="flex min-h-0 flex-1 flex-col"
      onValueChange={(value) =>
        setSearchParams({ sidebarTab: value as "orders" | "activity" })
      }
      value={sidebarTab}
    >
      <TabsList className="h-8 w-full shrink-0 rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          className="h-8 flex-1 rounded-none border-transparent border-b-2 px-2 text-xs data-active:border-primary data-active:bg-transparent data-active:shadow-none"
          value="orders"
        >
          Objednávky ({orders.length})
        </TabsTrigger>
        <TabsTrigger
          className="h-8 flex-1 rounded-none border-transparent border-b-2 px-2 text-xs data-active:border-primary data-active:bg-transparent data-active:shadow-none"
          value="activity"
        >
          Aktivita ({activity.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent
        className="mt-0 flex min-h-0 flex-1 flex-col gap-1 px-2 pt-2"
        value="orders"
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <SidebarOrdersList orders={orders} />
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "w-full shrink-0"
          )}
          href={`/admin/eshop/orders?date=${date}`}
        >
          Všetky
          <ChevronRightIcon />
        </Link>
      </TabsContent>

      <TabsContent
        className="mt-0 flex min-h-0 flex-1 flex-col gap-1 px-2 pt-2"
        value="activity"
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <ActivityFeed activity={activity} />
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "w-full shrink-0"
          )}
          href={`/admin/system/activity?date=${date}`}
        >
          Všetky
          <ChevronRightIcon />
        </Link>
      </TabsContent>
    </Tabs>
  );
}
