import { Navigation } from "lucide-react";
import { formatDistance } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";

type DistanceBadgeProps = {
  distance: number;
  className?: string;
  variant?: "default" | "light";
};

export function DistanceBadge({
  distance,
  className,
  variant = "default",
}: DistanceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs",
        variant === "default" &&
          "bg-neutral-900/80 text-white backdrop-blur-sm",
        variant === "light" && "bg-neutral-100 text-neutral-700",
        className
      )}
    >
      <Navigation className="size-3" />
      {formatDistance(distance)}
    </span>
  );
}
