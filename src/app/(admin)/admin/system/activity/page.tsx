import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivityFeed } from "@/features/activity-log/api/queries";
import { ActivityFeed } from "@/features/activity-log/components/activity-feed";
import { ActivityFilters } from "./activity-filters";
import { loadActivitySearchParams } from "./activity-search-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ActivityPageContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { entity, role } = await loadActivitySearchParams(searchParams);
  const activity = await getActivityFeed({ entity, role });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <ActivityFilters />
      <div className="rounded-lg border bg-card">
        <ActivityFeed
          activity={activity}
          detailed
          emptyLabel="Žiadna aktivita pre zvolený filter."
        />
      </div>
    </div>
  );
}

export default function AdminActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-96" />}>
      <ActivityPageContent searchParams={searchParams} />
    </Suspense>
  );
}
