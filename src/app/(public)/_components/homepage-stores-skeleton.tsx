import { Skeleton } from "@/components/ui/skeleton";

export function HomepageStoresSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-[450px] rounded-md md:h-[480px]" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="min-h-[380px] rounded-md md:min-h-[460px] lg:min-h-[520px]" />
        <div className="flex justify-center gap-2">
          <Skeleton className="h-2 w-6 rounded-full" />
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="size-2 rounded-full" />
        </div>
      </div>
    </div>
  );
}
