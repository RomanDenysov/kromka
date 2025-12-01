/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import {
  addDays,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfToday,
} from "date-fns";
import { sk } from "date-fns/locale/sk";
import { Calendar1Icon, ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { StoreSchedule } from "@/db/types";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type OrderPickupDatePickerProps = {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  storeSchedule: StoreSchedule | null;
};

/**
 * Checks if a store is closed on a given date based on its schedule.
 * Considers both regular hours and exceptions.
 */
function isStoreClosed(date: Date, schedule: StoreSchedule | null): boolean {
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

export function OrderPickupDatePicker({
  selectedDate,
  onDateSelect,
  storeSchedule,
}: OrderPickupDatePickerProps) {
  const [open, setOpen] = useState(false);

  const isBeforeNoon = useMemo(() => {
    const now = new Date();
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    return isBefore(now, noon);
  }, []);

  const handleSelectDate = useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) {
        return;
      }

      const today = startOfToday();
      const tomorrow = addDays(today, 1);

      // Past dates
      if (isBefore(newDate, today)) {
        return;
      }

      // Today is not available
      if (isSameDay(newDate, today)) {
        return;
      }

      // Tomorrow only if before noon
      if (isSameDay(newDate, tomorrow) && !isBeforeNoon) {
        return;
      }

      // Max 30 days ahead
      const maxDate = addDays(today, 30);
      if (isAfter(newDate, maxDate)) {
        return;
      }

      // Store closed on this day
      if (isStoreClosed(newDate, storeSchedule)) {
        return;
      }

      onDateSelect(newDate);
      setOpen(false);
    },
    [isBeforeNoon, storeSchedule, onDateSelect]
  );

  const disabledDays = useCallback(
    (d: Date) => {
      const today = startOfToday();
      const tomorrow = addDays(today, 1);
      const maxDate = addDays(today, 30);

      return (
        isBefore(d, today) ||
        isSameDay(d, today) ||
        (isSameDay(d, tomorrow) && !isBeforeNoon) ||
        isAfter(d, maxDate) ||
        isStoreClosed(d, storeSchedule)
      );
    },
    [isBeforeNoon, storeSchedule]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-start font-normal"
          id="date"
          size="sm"
          variant="outline"
        >
          <Calendar1Icon />
          {selectedDate
            ? format(selectedDate, "PP", { locale: sk })
            : "--/--/--"}
          <ChevronDownIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          captionLayout="dropdown"
          disabled={disabledDays}
          locale={sk}
          mode="single"
          onSelect={handleSelectDate}
          required
          selected={selectedDate}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
