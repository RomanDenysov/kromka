import { format, getDay } from "date-fns";
import type { StoreSchedule, TimeRange } from "@/db/types";

/**
 * Neutral store-schedule reading primitives. Pure functions over a
 * StoreSchedule - no feature/app coupling - so both feature code (checkout,
 * orders, stores) and shared lib utilities can depend on them.
 */

export const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const DATE_KEY_FORMAT = "yyyy-MM-dd";

/**
 * Checks if a store is closed on a given date based on its schedule.
 * Considers both regular hours and exceptions.
 */
export function isStoreClosed(
  date: Date,
  schedule: StoreSchedule | null
): boolean {
  if (!schedule) {
    return false;
  }

  const dateKey = format(date, DATE_KEY_FORMAT);

  // Check exceptions first (holiday closures, special hours, etc.)
  const exception = schedule.exceptions?.[dateKey];
  if (exception !== undefined) {
    return exception === "closed" || exception === null;
  }

  // Check regular hours
  const dayOfWeek = getDay(date);
  const dayKey = DAY_KEYS[dayOfWeek];
  const daySchedule = schedule.regularHours[dayKey];

  return daySchedule === "closed" || daySchedule === null;
}

/**
 * Gets the time range for a specific date from the store schedule.
 * Returns null if the store is closed on that date.
 */
export function getTimeRangeForDate(
  date: Date | undefined,
  schedule: StoreSchedule | null
): TimeRange | null {
  if (!(date && schedule)) {
    return null;
  }

  const dateKey = format(date, DATE_KEY_FORMAT);

  // Check exceptions first (holiday closures, special hours, etc.)
  const exception = schedule.exceptions?.[dateKey];
  if (exception !== undefined) {
    return exception === "closed" || exception === null ? null : exception;
  }

  // Check regular hours
  const dayOfWeek = getDay(date);
  const dayKey = DAY_KEYS[dayOfWeek];
  const daySchedule = schedule.regularHours[dayKey];

  return daySchedule === "closed" || daySchedule === null ? null : daySchedule;
}
