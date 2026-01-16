import { startOfToday } from "date-fns";
import type { DaySchedule, StoreSchedule, TimeRange } from "@/db/types";
import { getTimeRangeForDate } from "@/features/checkout/utils";

const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

const WEEKEND_KEYS = ["saturday", "sunday"] as const;

const isTimeRange = (schedule: DaySchedule): schedule is TimeRange =>
  Boolean(schedule && schedule !== "closed");

/**
 * Formats a time range for UI display or "Zatvorené".
 */
export const formatTimeRange = (schedule: TimeRange | null) => {
  if (!schedule) {
    return "Zatvorené";
  }
  return `${schedule.start} – ${schedule.end}`;
};

/**
 * Formats a daily schedule for UI display or "Zatvorené".
 */
export const formatDaySchedule = (schedule: DaySchedule) => {
  if (!schedule || schedule === "closed") {
    return "Zatvorené";
  }
  return `${schedule.start} – ${schedule.end}`;
};

const areTimeRangesEqual = (a: DaySchedule, b: DaySchedule) => {
  if (!(isTimeRange(a) && isTimeRange(b))) {
    return false;
  }
  return a.start === b.start && a.end === b.end;
};

const getWeekdaySummary = (schedule: StoreSchedule | null) => {
  if (!schedule) {
    return null;
  }

  const weekdaySchedules = WEEKDAY_KEYS.map(
    (day) => schedule.regularHours[day]
  );
  const firstWeekday = weekdaySchedules[0];
  const weekdaysMatch = weekdaySchedules.every((daySchedule) =>
    areTimeRangesEqual(daySchedule, firstWeekday)
  );
  const weekendClosed = WEEKEND_KEYS.every((day) => {
    const daySchedule = schedule.regularHours[day];
    return daySchedule === "closed" || daySchedule === null;
  });

  if (weekdaysMatch && isTimeRange(firstWeekday) && weekendClosed) {
    return `Po-Pia: ${formatDaySchedule(firstWeekday)}`;
  }

  return null;
};

/**
 * Returns a friendly opening-hours label for store listings.
 */
export const getOpeningHoursLabel = (schedule: StoreSchedule | null) => {
  if (!schedule) {
    return null;
  }

  const weekdaySummary = getWeekdaySummary(schedule);
  if (weekdaySummary) {
    return weekdaySummary;
  }

  const todaySchedule = getTimeRangeForDate(startOfToday(), schedule);
  return `Dnes: ${formatTimeRange(todaySchedule)}`;
};
