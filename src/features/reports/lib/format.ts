/** Slovak EUR formatting for cents. */
export function formatEur(cents: number | null): string {
  if (cents === null) {
    return "—";
  }
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Margin %, one decimal place, Slovak format. */
export function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(1).replace(".", ",")} %`;
}

/** Color class based on margin %. */
export function marginColor(pct: number | null): string {
  if (pct === null) {
    return "text-muted-foreground";
  }
  if (pct < 10) {
    return "text-destructive";
  }
  if (pct < 30) {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-emerald-600 dark:text-emerald-400";
}
