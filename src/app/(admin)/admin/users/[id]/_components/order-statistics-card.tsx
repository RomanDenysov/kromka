import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type Props = {
  totalOrders: number;
  totalSpent: number;
  promoCodeUsages: number;
};

export function OrderStatisticsCard({
  totalOrders,
  totalSpent,
  promoCodeUsages,
}: Props) {
  const averageOrder =
    totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Štatistiky objednávok</CardTitle>
        <CardDescription>
          Prehľad objednávok a finančných údajov
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatItem label="Celkom objednávok" value={totalOrders.toString()} />
          <StatItem label="Celkové výdavky" value={formatPrice(totalSpent)} />
          <StatItem
            label="Priemerná objednávka"
            value={formatPrice(averageOrder)}
          />
          <StatItem
            label="Použité promo kódy"
            value={promoCodeUsages.toString()}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-bold text-2xl">{value}</span>
    </div>
  );
}
