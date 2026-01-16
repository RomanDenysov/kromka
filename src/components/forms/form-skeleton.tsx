import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function FormSkeleton({
  rows = 7,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="flex flex-col items-start gap-3"
          key={`row-${index.toString()}`}
        >
          <Skeleton className="h-6 w-30" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}
