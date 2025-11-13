import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
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
