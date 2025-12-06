import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRevenueHistory } from "@/lib/queries/dashboard";
import { RevenueChart } from "./revenue-chart";

export async function RevenueChartSection() {
  const revenueHistory = await getRevenueHistory({ days: 30 });
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Prehľad tržieb</CardTitle>
        <CardDescription>
          Tržby za posledných 30 dní z uhradených objednávok.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <RevenueChart data={revenueHistory} />
      </CardContent>
    </Card>
  );
}
