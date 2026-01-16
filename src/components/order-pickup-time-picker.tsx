"use client";

import { ChevronDownIcon, ClockIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { TimeRange } from "@/db/types";
import {
  filterTimeSlots,
  generateAllTimeSlots,
} from "@/features/checkout/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  const [open, setOpen] = useState(false);
  const timeOptions = useMemo(() => {
    if (!timeRange) {
      return [];
    }
    const allSlots = generateAllTimeSlots();
    return filterTimeSlots(allSlots, timeRange);
  }, [timeRange]);

  const isDisabled = disabled || timeOptions.length === 0;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-10 w-full justify-start gap-3 font-medium text-sm"
          disabled={isDisabled}
          id="time"
          variant="outline"
        >
          <ClockIcon className="size-5 shrink-0 text-muted-foreground" />
          {selectedTime ? (
            <span className="truncate">{selectedTime}</span>
          ) : (
            <span className="truncate">--:--</span>
          )}
          <ChevronDownIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="scrollbar-hide w-auto rounded-sm p-2"
      >
        <div className="scrollbar-hide grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto">
          {timeOptions.map((time) => (
            <Button
              className="h-8 rounded-sm"
              key={time}
              onClick={() => {
                onTimeSelect(time);
                setOpen(false);
              }}
              size="sm"
              variant={selectedTime === time ? "default" : "outline"}
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
