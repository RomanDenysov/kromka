import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCardSkeleton } from "./metric-card-skeleton";

const METRICS_COUNT = 4;
const RECENT_ORDERS_COLUMNS = 5;
const RECENT_ORDERS_ROWS = 5;

export function DashboardMetricsSkeleton() {
  return (
    <div className="grid gap-0.5 bg-muted p-0.5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: METRICS_COUNT }).map((_, index) => (
        <MetricCardSkeleton key={`metric-skeleton-${index.toString()}`} />
      ))}
    </div>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-2">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex gap-2 px-1 py-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-36" />
      </div>
      <DataTableSkeleton
        columnCount={RECENT_ORDERS_COLUMNS}
        rowCount={RECENT_ORDERS_ROWS}
      />
    </div>
  );
}
