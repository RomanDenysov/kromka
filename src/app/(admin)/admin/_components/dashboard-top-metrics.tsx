import { Calendar, CreditCard, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewDashboardMetrics } from "@/lib/queries/dashboard-metrics";
import { cn, formatPrice } from "@/lib/utils";

function TrendBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  let className = "font-medium text-xs";
  let prefix = "";

  if (isNeutral) {
    className = cn(className, "text-muted-foreground");
    prefix = "";
  } else if (isPositive) {
    className = cn(className, "text-green-600 dark:text-green-400");
    prefix = "+";
  } else {
    className = cn(className, "text-red-600 dark:text-red-400");
    prefix = "";
  }

  return (
    <span className={className}>
      {prefix}
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
          <div className="font-semibold text-2xl">
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
          <div className="font-semibold text-2xl">{metrics.newOrdersCount}</div>
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
          <div className="flex flex-row items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-xl">
                {formatPrice(metrics.averageOrderValue.averageCents)}
              </div>
              <p className="text-muted-foreground text-xs">
                Zaplatené: {metrics.averageOrderValue.orderCount} objednávok
              </p>
            </div>
            <div>
              <div className="font-semibold text-muted-foreground text-xl">
                {formatPrice(metrics.averageOrderValue.allOrdersAverageCents)}
              </div>
              <p className="text-muted-foreground text-xs">
                Všetky: {metrics.averageOrderValue.allOrdersCount} objednávok za
                30 dní
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Na zajtra plánované
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-2xl">
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
