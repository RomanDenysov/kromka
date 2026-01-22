import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGrowthComparison } from "@/features/admin-dashboard/api/metrics";
import { cn, formatPrice } from "@/lib/utils";

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  let className = "font-medium text-xs";
  let indicator = "";

  if (isNeutral) {
    className = cn(className, "text-muted-foreground");
    indicator = "—";
  } else if (isPositive) {
    className = cn(className, "text-green-600 dark:text-green-400");
    indicator = "↑";
  } else {
    className = cn(className, "text-red-600 dark:text-red-400");
    indicator = "↓";
  }

  return (
    <span className={className}>
      {indicator} {Math.abs(value)}%
    </span>
  );
}

export async function GrowthComparisonCard() {
  const data = await getGrowthComparison();

  const metrics = [
    {
      label: "Objednávky",
      current: data.currentMonth.orders,
      previous: data.previousMonth.orders,
      change: data.changes.ordersPercent,
    },
    {
      label: "Tržby",
      current: data.currentMonth.revenueCents,
      previous: data.previousMonth.revenueCents,
      change: data.changes.revenuePercent,
      format: (val: number) => formatPrice(val),
    },
    {
      label: "Noví zákazníci",
      current: data.currentMonth.newCustomers,
      previous: data.previousMonth.newCustomers,
      change: data.changes.customersPercent,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium text-sm">
          Rast (mesiac vs. mesiac)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div className="space-y-1" key={metric.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <TrendIndicator value={metric.change} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-xs">
                  Tento mesiac:{" "}
                  <span className="font-semibold text-foreground">
                    {metric.format
                      ? metric.format(metric.current)
                      : metric.current}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  Minulý mesiac:{" "}
                  <span className="font-semibold">
                    {metric.format
                      ? metric.format(metric.previous)
                      : metric.previous}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
