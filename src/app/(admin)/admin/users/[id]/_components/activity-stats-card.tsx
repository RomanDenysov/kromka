import {
  CreditCardIcon,
  HeartIcon,
  MessageSquareIcon,
  PackageIcon,
  ShoppingBagIcon,
  StarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/features/user-management/api/queries";
import { formatPrice } from "@/lib/utils";

type Props = {
  user: NonNullable<User>;
  totalOrders: number;
  totalSpent: number;
};

export function ActivityStatsCard({ user, totalOrders, totalSpent }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktivita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatRow
          icon={ShoppingBagIcon}
          label="Objednávky"
          value={totalOrders.toString()}
        />
        <StatRow
          icon={CreditCardIcon}
          label="Celkové výdavky"
          value={formatPrice(totalSpent)}
        />
        <StatRow
          icon={StarIcon}
          label="Recenzie"
          value={(user.reviews?.length ?? 0).toString()}
        />
        <StatRow
          icon={HeartIcon}
          label="Obľúbené"
          value={(user.favorites?.length ?? 0).toString()}
        />
        <StatRow
          icon={MessageSquareIcon}
          label="Komentáre"
          value={(user.postComments?.length ?? 0).toString()}
        />
        <StatRow
          icon={PackageIcon}
          label="Príspevky"
          value={(user.posts?.length ?? 0).toString()}
        />
      </CardContent>
    </Card>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
