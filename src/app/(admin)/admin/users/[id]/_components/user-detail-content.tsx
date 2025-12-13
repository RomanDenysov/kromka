import type { User } from "@/lib/queries/users";
import { ActivityStatsCard } from "./activity-stats-card";
import { OrderStatisticsCard } from "./order-statistics-card";
import { RecentOrdersCard } from "./recent-orders-card";
import { UserProfileCard } from "./user-profile-card";

type Props = {
  user: NonNullable<User>;
};

export function UserDetailContent({ user }: Props) {
  const totalOrders = user.orders?.length ?? 0;
  const totalSpent =
    user.orders?.reduce((sum, order) => sum + (order.totalCents ?? 0), 0) ?? 0;
  const recentOrders = user.orders?.slice(0, 10) ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <UserProfileCard user={user} />
        <ActivityStatsCard
          totalOrders={totalOrders}
          totalSpent={totalSpent}
          user={user}
        />
      </div>
      <div className="space-y-4 lg:col-span-2">
        <OrderStatisticsCard
          promoCodeUsages={user.promoCodeUsages?.length ?? 0}
          totalOrders={totalOrders}
          totalSpent={totalSpent}
        />
        <RecentOrdersCard
          recentOrders={recentOrders}
          totalOrders={totalOrders}
          userId={user.id}
        />
      </div>
    </div>
  );
}
