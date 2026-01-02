import {
  addDays,
  format,
  getDay,
  isAfter,
  isBefore,
  startOfToday,
} from "date-fns";
import type { StoreSchedule, TimeRange } from "@/db/types";
import type { DetailedCartItem } from "@/lib/cart/queries";

const ORDER_CUTOFF_HOUR = 12;

/**
 * Checks if the current time is before the daily cutoff for next-day orders.
 */
export function isBeforeDailyCutoff(): boolean {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(ORDER_CUTOFF_HOUR, 0, 0, 0);
  return isBefore(now, cutoff);
}

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
  const canOrderForTomorrow = isBeforeDailyCutoff();

  // Start from tomorrow, or day after if past cutoff
  const startDate = canOrderForTomorrow ? addDays(today, 1) : addDays(today, 2);
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

/**
 * Computes the restricted pickup dates based on cart items.
 * Returns null if there are no restrictions (all dates allowed).
 * Returns Set of allowed date strings (yyyy-MM-dd) if restrictions exist.
 */
export function getRestrictedPickupDates(
  cartItems: DetailedCartItem[]
): Set<string> | null {
  const restrictedSets: Set<string>[] = [];

  for (const item of cartItems) {
    const pickupDates = item.category?.pickupDates ?? [];
    if (pickupDates && pickupDates.length > 0) {
      restrictedSets.push(new Set(pickupDates));
    }
  }

  // No restrictions from any item
  if (restrictedSets.length === 0) {
    return null;
  }

  // Start with first restricted set, then intersect with others
  let result = restrictedSets[0];
  for (let i = 1; i < restrictedSets.length; i++) {
    const nextSet = restrictedSets[i];
    result = new Set([...result].filter((date) => nextSet.has(date)));
  }

  return result;
}

/**
 * Checks if a date is allowed based on cart category restrictions.
 * If restrictedDates is null, all dates are allowed.
 */
export function isDateAllowedByCart(
  date: Date,
  restrictedDates: Set<string> | null
): boolean {
  if (!restrictedDates) {
    return true;
  }
  const dateKey = format(date, "yyyy-MM-dd");
  return restrictedDates.has(dateKey);
}

/**
 * Validates if a date is valid for pickup considering all requirements:
 * - Not in the past
 * - Not today
 * - Not tomorrow if past cutoff
 * - Within 30 days
 * - Store is open
 * - Allowed by cart restrictions
 */
export function isValidPickupDate(
  date: Date,
  schedule: StoreSchedule | null,
  restrictedDates: Set<string> | null
): boolean {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 30);
  const canOrderForTomorrow = isBeforeDailyCutoff();

  // Past dates or today
  if (
    isAfter(today, date) ||
    format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  ) {
    return false;
  }

  // Tomorrow only if before cutoff
  if (
    format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd") &&
    !canOrderForTomorrow
  ) {
    return false;
  }

  // Max 30 days ahead
  if (isAfter(date, maxDate)) {
    return false;
  }

  // Store closed
  if (isStoreClosed(date, schedule)) {
    return false;
  }

  // Cart restrictions
  if (!isDateAllowedByCart(date, restrictedDates)) {
    return false;
  }

  return true;
}

/**
 * Finds the first available pickup date considering both store schedule
 * and cart category restrictions.
 */
export function getFirstAvailableDateWithRestrictions(
  schedule: StoreSchedule | null,
  restrictedDates: Set<string> | null
): Date | null {
  const today = startOfToday();
  const canOrderForTomorrow = isBeforeDailyCutoff();

  // Start from tomorrow, or day after if past cutoff
  const startDate = canOrderForTomorrow ? addDays(today, 1) : addDays(today, 2);
  const maxDate = addDays(today, 30);

  let currentDate = startDate;

  while (!isAfter(currentDate, maxDate)) {
    const isStoreOpen = !isStoreClosed(currentDate, schedule);
    const isAllowedByCart = isDateAllowedByCart(currentDate, restrictedDates);

    if (isStoreOpen && isAllowedByCart) {
      return currentDate;
    }
    currentDate = addDays(currentDate, 1);
  }

  return null;
}
