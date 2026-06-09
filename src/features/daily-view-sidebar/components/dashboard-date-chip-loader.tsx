import { format, getMonth, getYear } from "date-fns";
import { loadDashboardSearchParams } from "@/app/(admin)/admin/(dashboard)/dashboard-search-params";
import {
  getMonthlyOrderStats,
  getOrdersByPickupDate,
} from "@/features/admin-dashboard/api/queries";
import { DashboardDateChip } from "./dashboard-date-chip";

interface DashboardDateChipLoaderProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function DashboardDateChipLoader({
  searchParams,
}: DashboardDateChipLoaderProps) {
  const { date } = await loadDashboardSearchParams(searchParams);
  const formattedDate = format(date, "yyyy-MM-dd");
  const year = getYear(date);
  const month = getMonth(date);

  const [orders, monthlyStats] = await Promise.all([
    getOrdersByPickupDate(formattedDate),
    getMonthlyOrderStats(year, month),
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
    <DashboardDateChip dailyStats={dailyStats} orderCount={orders.length} />
  );
}
