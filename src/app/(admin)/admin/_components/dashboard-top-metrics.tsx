import { Calendar, CreditCard, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewDashboardMetrics } from "@/lib/queries/dashboard-metrics";
import { cn, formatPrice } from "@/lib/utils";

function TrendBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        "font-medium text-xs",
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {isPositive ? "+" : ""}
      {value}%
    </span>
  );
}

export async function DashboardTopMetrics() {
  const metrics = await getNewDashboardMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Týždenné tržby</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {formatPrice(metrics.weeklyRevenue.currentWeekCents)}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>vs. minulý týždeň</span>
            <TrendBadge value={metrics.weeklyRevenue.percentChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Nové objednávky</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{metrics.newOrdersCount}</div>
          <p className="text-muted-foreground text-xs">
            Objednávky so stavom "nová"
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Priemerný košík</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {formatPrice(metrics.averageOrderValue.averageCents)}
          </div>
          <p className="text-muted-foreground text-xs">
            {metrics.averageOrderValue.orderCount} objednávok za 30 dní
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Zajtra</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {metrics.tomorrowSummary.orderCount} objednávok
          </div>
          <p className="text-muted-foreground text-xs">
            {formatPrice(metrics.tomorrowSummary.expectedRevenueCents)} •{" "}
            {metrics.tomorrowSummary.productCount} produktov
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
