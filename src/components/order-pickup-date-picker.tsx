/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import { Calendar1Icon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function OrderPickupDatePicker() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 12));

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-start font-normal"
          id="date"
          variant="outline"
        >
          <Calendar1Icon />
          {date ? date.toLocaleDateString() : "Select date"}
          <ChevronDownIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          captionLayout="dropdown"
          mode="single"
          onSelect={(d) => {
            setDate(d);
            setOpen(false);
          }}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}
