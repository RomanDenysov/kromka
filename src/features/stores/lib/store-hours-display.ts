import { startOfToday } from "date-fns";
import type { TimeRange } from "@/db/types";
import {
  getTimeRangeForDate,
  parseTimeToMinutes,
} from "@/features/checkout/utils";
import type { Store } from "@/features/stores/api/queries";

export function getTodaySchedule(
  openingHours: Store["openingHours"]
): TimeRange | null {
  if (!openingHours) {
    return null;
  }
  return getTimeRangeForDate(startOfToday(), openingHours);
}

export function isCurrentlyOpen(schedule: TimeRange | null): boolean {
  if (!schedule) {
    return false;
  }
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    currentMinutes >= parseTimeToMinutes(schedule.start) &&
    currentMinutes < parseTimeToMinutes(schedule.end)
  );
}

export function formatTimeRange(schedule: TimeRange | null): string {
  if (!schedule) {
    return "Zatvorene";
  }
  return `${schedule.start} - ${schedule.end}`;
}
