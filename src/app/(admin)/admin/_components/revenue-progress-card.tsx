import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getRevenueComparison } from "@/lib/queries/dashboard-metrics";
import { formatPrice } from "@/lib/utils";

export async function RevenueProgressCard() {
  const data = await getRevenueComparison();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium text-sm">
          Porovnanie tržieb (7 dní)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Očakávané</span>
            <span className="font-semibold">
              {formatPrice(data.expectedCents)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prijaté</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(data.receivedCents)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Čakajúce</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatPrice(data.pendingCents)}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Miera dokončenia</span>
            <span className="font-semibold">{data.completionRate}%</span>
          </div>
          <Progress className="h-2" value={data.completionRate} />
        </div>
      </CardContent>
    </Card>
  );
}
