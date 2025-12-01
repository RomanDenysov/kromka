"use client";

import { useMemo } from "react";
import type { TimeRange } from "@/db/types";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const INTERVAL_MINUTES = 15;
const SLOTS_PER_DAY = (24 * 60) / INTERVAL_MINUTES;

/**
 * Generates all time slots for a full day (00:00 - 23:45).
 */
function generateAllTimeSlots(): string[] {
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
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Filters time slots to only include those within the given range.
 */
function filterTimeSlots(allSlots: string[], range: TimeRange): string[] {
  const startMinutes = parseTimeToMinutes(range.start);
  const endMinutes = parseTimeToMinutes(range.end);

  return allSlots.filter((slot) => {
    const slotMinutes = parseTimeToMinutes(slot);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
}

type OrderPickupTimePickerProps = {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  /** Time range from store opening hours. Required to show time options. */
  timeRange: TimeRange | null;
  disabled?: boolean;
};

export function OrderPickupTimePicker({
  selectedTime,
  onTimeSelect,
  timeRange,
  disabled = false,
}: OrderPickupTimePickerProps) {
  const timeOptions = useMemo(() => {
    // No time range = no store schedule configured or store closed
    if (!timeRange) {
      return [];
    }

    const allSlots = generateAllTimeSlots();
    return filterTimeSlots(allSlots, timeRange);
  }, [timeRange]);

  const isSelectedTimeValid = timeOptions.includes(selectedTime);

  const isDisabled = disabled || timeOptions.length === 0;

  return (
    <Select
      disabled={isDisabled}
      onValueChange={onTimeSelect}
      value={isSelectedTimeValid ? selectedTime : undefined}
    >
      <SelectTrigger
        className="min-w-24 font-normal focus:ring-0 focus:ring-offset-0"
        size="sm"
      >
        <SelectValue placeholder="--:--" />
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        <ScrollArea className="h-60 pr-2.5">
          {timeOptions.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
