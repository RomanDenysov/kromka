import { Skeleton } from "@/components/ui/skeleton";

export function HomepageStoresSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-[450px] rounded-xl md:h-[480px]" />
    </div>
  );
}
