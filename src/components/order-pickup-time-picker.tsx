/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4)
    .toString()
    .padStart(2, "0");
  const minute = ((i % 4) * 15).toString().padStart(2, "0");
  return `${hour}:${minute}`;
});

export function OrderPickupTimePicker({
  selectedTime,
  onTimeSelect,
}: {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}) {
  return (
    <Select onValueChange={onTimeSelect} value={selectedTime}>
      <SelectTrigger
        className="w-28 min-w-0 font-normal focus:ring-0 focus:ring-offset-0"
        size="sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-60 pr-2.5">
          {TIME_OPTIONS.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
