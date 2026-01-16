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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { StoreSchedule } from "@/db/types";
import {
  isBeforeDailyCutoff,
  isDateAllowedByCart,
  isStoreClosed,
} from "@/features/checkout/utils";

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

  const canOrderForTomorrow = useMemo(() => isBeforeDailyCutoff(), []);

  const today = useMemo(() => startOfToday(), []);
  const maxDate = useMemo(() => addDays(today, 30), [today]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      const tomorrow = addDays(today, 1);

      return (
        isBefore(date, today) ||
        isSameDay(date, today) ||
        (isSameDay(date, tomorrow) && !canOrderForTomorrow) ||
        isAfter(date, maxDate) ||
        isStoreClosed(date, storeSchedule) ||
        !isDateAllowedByCart(date, restrictedDates)
      );
    },
    [today, maxDate, canOrderForTomorrow, storeSchedule, restrictedDates]
  );

  const handleSelectDate = useCallback(
    (newDate: Date | undefined) => {
      if (!newDate || isDateDisabled(newDate)) {
        return;
      }
      onDateSelect(newDate);
      setOpen(false);
    },
    [isDateDisabled, onDateSelect]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-10 w-full justify-start gap-3 font-medium text-sm"
          id="date"
          variant="outline"
        >
          <Calendar1Icon className="size-5 shrink-0 text-muted-foreground" />
          {selectedDate
            ? format(selectedDate, "PP", { locale: sk })
            : "--/--/--"}
          <ChevronDownIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          captionLayout="label"
          disabled={isDateDisabled}
          endMonth={maxDate}
          locale={sk}
          mode="single"
          onSelect={handleSelectDate}
          required
          selected={selectedDate}
          startMonth={today}
          timeZone="Europe/Bratislava"
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
