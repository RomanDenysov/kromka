import { Skeleton } from "@/components/ui/skeleton";

export function HomepageBlogSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c"].map((key) => (
          <div
            className="flex flex-col overflow-hidden rounded-lg border bg-card"
            key={key}
          >
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
