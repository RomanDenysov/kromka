import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-start justify-center gap-2 bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>

      <span className="font-bold text-2xl">{value}</span>
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </div>
  );
}
