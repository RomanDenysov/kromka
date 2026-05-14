import {
  endOfDay,
  formatISO,
  isValid,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { PeriodPreset } from "./constants";

export interface Period {
  from: Date;
  /** Identical-length window immediately before [from, to] for period-over-period. */
  previousFrom: Date;
  previousTo: Date;
  to: Date;
}

function safeParseIso(s: string | undefined): Date | null {
  if (!s) {
    return null;
  }
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

/**
 * Resolve a preset or custom [from, to] into a fully-populated Period
 * with a previous comparison window of the same length.
 */
export function resolvePeriod(
  preset: PeriodPreset | undefined,
  customFromIso?: string,
  customToIso?: string
): Period {
  const now = new Date();
  const today = endOfDay(now);

  let from: Date;
  let to: Date = today;

  switch (preset) {
    case "7d":
      from = startOfDay(subDays(today, 7));
      break;
    case "90d":
      from = startOfDay(subDays(today, 90));
      break;
    case "mtd":
      from = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
      break;
    case "ytd":
      from = startOfDay(new Date(today.getFullYear(), 0, 1));
      break;
    case "custom": {
      const parsedFrom = safeParseIso(customFromIso);
      const parsedTo = safeParseIso(customToIso);
      from = parsedFrom
        ? startOfDay(parsedFrom)
        : startOfDay(subDays(today, 30));
      to = parsedTo ? endOfDay(parsedTo) : today;
      break;
    }
    default:
      from = startOfDay(subDays(today, 30));
  }

  const lengthMs = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - lengthMs);

  return { from, to, previousFrom, previousTo };
}

export function formatPeriodForFilename(p: Period): string {
  return `${formatISO(p.from, { representation: "date" })}_${formatISO(p.to, { representation: "date" })}`;
}
