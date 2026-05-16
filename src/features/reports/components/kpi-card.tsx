import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Optional delta vs previous period (signed percent). */
  deltaPct?: number | null;
  hint?: string;
  label: string;
  value: string;
}

/**
 * Compact KPI block. One per metric, three or four side-by-side at the
 * top of a report.
 */
export function KpiCard({ label, value, deltaPct, hint, className }: Props) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold text-2xl tabular-nums">{value}</p>
      {deltaPct !== undefined && deltaPct !== null && (
        <p
          className={cn(
            "mt-1 text-xs",
            deltaPct >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          {deltaPct >= 0 ? "▲" : "▼"}{" "}
          {Math.abs(deltaPct).toFixed(1).replace(".", ",")} %
          {" vs predchádzajúce obdobie"}
        </p>
      )}
      {hint && <p className="mt-1 text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
