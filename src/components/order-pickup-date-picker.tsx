/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSunday,
  startOfToday,
} from "date-fns";
import { sk } from "date-fns/locale/sk";
import { Calendar1Icon, ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function OrderPickupDatePicker({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  const isBeforeNoon = useMemo(() => {
    const now = new Date();
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    return isBefore(now, noon);
  }, []);

  const handleSelectDate = (newDate: Date | undefined) => {
    if (!newDate) {
      return;
    }

    const today = startOfToday();
    const tomorrow = addDays(today, 1);

    if (isSunday(newDate)) {
      return;
    }

    // if (isSameDay(newDate, SPECIAL_DISABLED_DATE)) {
    //   return;
    // }

    if (isBefore(newDate, today)) {
      return;
    }

    if (isSameDay(newDate, today)) {
      return;
    }

    if (isSameDay(newDate, tomorrow) && !isBeforeNoon) {
      return;
    }

    const maxDate = addDays(today, 30);
    if (isAfter(newDate, maxDate)) {
      return;
    }

    onDateSelect(newDate);
  };

  const disabledDays = useCallback(
    (d: Date) => {
      const today = startOfToday();
      const tomorrow = addDays(today, 1);

      return (
        isSunday(d) ||
        // isSameDay(d, SPECIAL_DISABLED_DATE)
        isBefore(d, today) ||
        isSameDay(d, today) ||
        (isSameDay(d, tomorrow) && !isBeforeNoon)
      );
    },
    [isBeforeNoon]
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
          {selectedDate ? (
            format(selectedDate, "PP", { locale: sk })
          ) : (
            <span>Zvoľte si dátum pre odber</span>
          )}
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
