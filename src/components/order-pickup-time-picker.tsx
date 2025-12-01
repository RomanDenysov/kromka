"use client";

import { useMemo } from "react";
import type { TimeRange } from "@/db/types";
import { filterTimeSlots, generateAllTimeSlots } from "@/lib/checkout-utils";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
