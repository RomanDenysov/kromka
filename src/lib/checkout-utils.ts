/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
import { addDays, format, getDay, isAfter, startOfToday } from "date-fns";
import type { StoreSchedule, TimeRange } from "@/db/types";

export const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const INTERVAL_MINUTES = 15;
export const SLOTS_PER_DAY = (24 * 60) / INTERVAL_MINUTES;

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

  const dateKey = format(date, "yyyy-MM-dd");

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
 * Finds the first available pickup date based on store schedule.
 */
export function getFirstAvailableDate(
  schedule: StoreSchedule | null
): Date | null {
  const today = startOfToday();
  const now = new Date();
  const isBeforeNoon = now.getHours() < 12;

  // Start from tomorrow, or day after if past noon
  const startDate = isBeforeNoon ? addDays(today, 1) : addDays(today, 2);
  const maxDate = addDays(today, 30);

  let currentDate = startDate;

  while (!isAfter(currentDate, maxDate)) {
    if (!isStoreClosed(currentDate, schedule)) {
      return currentDate;
    }
    currentDate = addDays(currentDate, 1);
  }

  return null;
}

/**
 * Gets the first available time slot from a time range.
 */
export function getFirstAvailableTime(timeRange: TimeRange | null): string {
  if (!timeRange) {
    return "";
  }
  return timeRange.start;
}

/**
 * Gets the time range for a specific date from the store schedule.
 * Returns null if the store is closed on that date.
 */
export function getTimeRangeForDate(
  date: Date | undefined,
  schedule: StoreSchedule | null
): TimeRange | null {
  if (!date) {
    return null;
  }

  if (!schedule) {
    return null;
  }

  const dateKey = format(date, "yyyy-MM-dd");

  // Check exceptions first
  const exception = schedule.exceptions?.[dateKey];
  if (exception === "closed" || exception === null) {
    return null;
  }
  if (exception) {
    return exception;
  }

  // Check regular hours
  const dayOfWeek = getDay(date);
  const dayKey = DAY_KEYS[dayOfWeek];
  const daySchedule = schedule.regularHours[dayKey];

  if (daySchedule === "closed" || daySchedule === null) {
    return null;
  }
  return daySchedule;
}

/**
 * Generates all time slots for a full day (00:00 - 23:45).
 */
export function generateAllTimeSlots(): string[] {
  return Array.from({ length: SLOTS_PER_DAY }, (_, i) => {
    const hour = Math.floor((i * INTERVAL_MINUTES) / 60)
      .toString()
      .padStart(2, "0");
    const minute = ((i * INTERVAL_MINUTES) % 60).toString().padStart(2, "0");
    return `${hour}:${minute}`;
  });
}

/**
 * Parses "HH:MM" string to total minutes from midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Filters time slots to only include those within the given range.
 */
export function filterTimeSlots(
  allSlots: string[],
  range: TimeRange
): string[] {
  const startMinutes = parseTimeToMinutes(range.start);
  const endMinutes = parseTimeToMinutes(range.end);

  return allSlots.filter((slot) => {
    const slotMinutes = parseTimeToMinutes(slot);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
}
