/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
"use client";

import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfToday,
} from "date-fns";
import { sk } from "date-fns/locale/sk";
import { Calendar1Icon, ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { StoreSchedule } from "@/db/types";
import { isDateAllowedByCart, isStoreClosed } from "@/lib/checkout-utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type OrderPickupDatePickerProps = {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  storeSchedule: StoreSchedule | null;
  /** Restricted dates from cart categories. Null = no restrictions */
  restrictedDates?: Set<string> | null;
};

export function OrderPickupDatePicker({
  selectedDate,
  onDateSelect,
  storeSchedule,
  restrictedDates = null,
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

      // Check category pickup date restrictions
      if (!isDateAllowedByCart(newDate, restrictedDates)) {
        return;
      }

      onDateSelect(newDate);
      setOpen(false);
    },
    [isBeforeNoon, storeSchedule, restrictedDates, onDateSelect]
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
        isStoreClosed(d, storeSchedule) ||
        !isDateAllowedByCart(d, restrictedDates)
      );
    },
    [isBeforeNoon, storeSchedule, restrictedDates]
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
