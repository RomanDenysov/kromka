import { format, getMonth, getYear } from "date-fns";
import { PlusIcon } from "lucide-react";
import { loadDashboardSearchParams } from "@/app/(admin)/admin/(dashboard)/dashboard-search-params";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getRecentActivity } from "@/features/activity-log/api/queries";
import {
  getMonthlyOrderStats,
  getOrdersByPickupDate,
  getProductsAggregateByPickupDate,
} from "@/features/admin-dashboard/api/queries";
import { getContextRailOpen } from "@/features/daily-view-sidebar/cookies";
import { ContextRailShell } from "./context-rail-shell";
import { DailyViewSidebarTabs } from "./daily-view-sidebar-tabs";
import { DashboardCalendar } from "./dashboard-calendar";

export async function DailyViewSidebar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const dashboardParams = await loadDashboardSearchParams(searchParams);
  const { date } = dashboardParams;
  const formattedDate = format(date, "yyyy-MM-dd");
  const year = getYear(date);
  const month = getMonth(date);
  const [orders, recentActivity, _products, monthlyStats, railOpen] =
    await Promise.all([
      getOrdersByPickupDate(formattedDate),
      getRecentActivity(),
      getProductsAggregateByPickupDate(formattedDate),
      getMonthlyOrderStats(year, month),
      getContextRailOpen(),
    ]);

  const dailyStats = monthlyStats.reduce(
    (acc, stat) => {
      if (stat.date) {
        acc[stat.date] = {
          orderCount: stat.orderCount,
          revenue: stat.totalRevenue,
        };
      }
      return acc;
    },
    {} as Record<string, { orderCount: number; revenue: number }>
  );

  return (
    <ContextRailShell defaultOpen={railOpen}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="shrink-0">
          <DashboardCalendar dailyStats={dailyStats} />
        </div>
        <Separator className="bg-sidebar-border" />
        <DailyViewSidebarTabs
          activity={recentActivity}
          date={date}
          orders={orders}
        />
        <div className="shrink-0 border-t p-2">
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <PlusIcon className="size-4" />
            <span>Nová objednávka</span>
          </Button>
        </div>
      </div>
    </ContextRailShell>
  );
}
