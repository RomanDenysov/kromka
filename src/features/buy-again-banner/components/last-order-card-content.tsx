import { Skeleton } from "@/components/ui/skeleton";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { LastOrderCard } from "./last-order-card";

export async function LastOrderCardContent() {
  const lastOrder = await getLastOrderWithItemsAction();
  if (!lastOrder) {
    return null;
  }
  return (
    <div className="px-2">
      <LastOrderCard items={lastOrder.items} />
    </div>
  );
}

export function LastOrderCardSkeleton() {
  return (
    <div className="px-2">
      <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2 py-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              className="h-12 w-full"
              key={`last-order-skeleton-${i.toString()}`}
            />
          ))}
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
