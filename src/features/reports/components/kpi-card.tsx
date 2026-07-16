import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Signed delta vs previous period, in the unit given by `deltaUnit`. */
  delta?: number | null;
  /** Unit suffix shown after the delta. Defaults to "%". */
  deltaUnit?: string;
  hint?: string;
  label: string;
  /** Which direction is favourable. Costs rising = bad, so pass "up-bad". */
  polarity?: "up-good" | "up-bad";
  value: string;
}

/**
 * Compact KPI block. One per metric, three or four side-by-side at the
 * top of a report. Always pairs the delta with an arrow + sign so the
 * "is this good?" signal never relies on colour alone.
 */
export function KpiCard({
  label,
  value,
  delta,
  deltaUnit = "%",
  hint,
  polarity = "up-good",
  className,
}: Props) {
  const hasDelta = delta !== undefined && delta !== null;
  const isUp = hasDelta && delta >= 0;
  const isGood = polarity === "up-bad" ? !isUp : isUp;

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold text-2xl tabular-nums">{value}</p>
      {hasDelta && (
        <p
          className={cn(
            "mt-1 text-xs",
            isGood
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          {isUp ? "▲" : "▼"} {Math.abs(delta).toFixed(1).replace(".", ",")}{" "}
          {deltaUnit}
          {" vs predchádzajúce obdobie"}
        </p>
      )}
      {hint && <p className="mt-1 text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
