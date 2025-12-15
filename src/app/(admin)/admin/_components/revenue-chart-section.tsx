import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRevenueAndOrdersHistory } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";
import { RevenueChart } from "./revenue-chart";

export async function RevenueChartSection() {
  const revenueHistory = await getRevenueAndOrdersHistory({ days: 30 });
  const totalRevenue = revenueHistory.reduce(
    (sum, day) => sum + day.revenue,
    0
  );
  const totalExpectedRevenue = revenueHistory.reduce(
    (sum, day) => sum + (day.expectedRevenue ?? 0),
    0
  );
  const averageRevenueCents =
    revenueHistory.length > 0
      ? Math.round(
          revenueHistory.reduce((sum, day) => sum + day.revenue, 0) /
            revenueHistory.length
        )
      : 0;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Prehľad tržieb</CardTitle>
        <CardDescription>
          Tržby za posledných 30 dní z uhradených objednávok s porovaním
          očakávaných tržieb. Skutočné tržby: {formatPrice(totalRevenue)} z{" "}
          {formatPrice(totalExpectedRevenue)} očakávaných
          {revenueHistory.length > 0 && (
            <> • Priemer {formatPrice(averageRevenueCents)}/deň</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <RevenueChart
          data={revenueHistory}
          showExpectedRevenue={true}
          showOrderCorrelation={true}
        />
      </CardContent>
    </Card>
  );
}
