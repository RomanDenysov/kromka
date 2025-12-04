import {
  CreditCardIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
} from "lucide-react";
import type { DashboardMetrics as DashboardMetricsType } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";
import { MetricCard } from "./metric-card";

type DashboardMetricsProps = {
  metrics: DashboardMetricsType;
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid gap-0.5 bg-muted p-0.5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        description="Za dnešné uhradené objednávky"
        icon={CreditCardIcon}
        title="Celkové tržby (dnes)"
        value={formatPrice(metrics.todaysRevenue)}
      />
      <MetricCard
        description='Objednávky so stavom "nová"'
        icon={ShoppingCartIcon}
        title="Nové objednávky"
        value={metrics.newOrdersCount}
      />
      <MetricCard
        description="Produkty, ktoré sú momentálne aktívne"
        icon={PackageIcon}
        title="Aktívne produkty"
        value={metrics.activeProductsCount}
      />
      <MetricCard
        description="Predajne, ktoré sú momentálne aktívne"
        icon={StoreIcon}
        title="Aktívne predajne"
        value={metrics.activeStoresCount}
      />
    </div>
  );
}
