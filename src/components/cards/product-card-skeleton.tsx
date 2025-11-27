import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-md p-0.5">
      <div className="aspect-square w-full rounded-md">
        <Skeleton className="size-full" />
      </div>
      <div className="flex size-full flex-col justify-between gap-2 px-1 pb-1">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
