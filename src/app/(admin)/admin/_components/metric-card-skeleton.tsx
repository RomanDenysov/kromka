import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function MetricCardSkeleton({ className }: Props) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-start justify-center gap-2 bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="size-5" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
