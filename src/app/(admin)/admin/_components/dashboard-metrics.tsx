import { Building2, CreditCard, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";

export async function DashboardMetrics() {
  const metrics = await getDashboardMetrics();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Celkové tržby (dnes)
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {formatPrice(metrics.todaysRevenue)}
          </div>
          <p className="text-muted-foreground text-xs">
            Za dnešné uhradené objednávky
          </p>
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
          <CardTitle className="font-medium text-sm">Aktívne firmy</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {metrics.activeCompaniesCount}
          </div>
          <p className="text-muted-foreground text-xs">
            Registrované B2B spoločnosti
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Aktívne produkty
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {metrics.activeProductsCount}
          </div>
          <p className="text-muted-foreground text-xs">
            Produkty momentálne v predaji
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
