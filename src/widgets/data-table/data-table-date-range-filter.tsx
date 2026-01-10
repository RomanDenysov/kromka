"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMounted } from "@/hooks/use-mounted";

export type DateRangeFilterValue = {
  from: string;
  to: string;
};

type DataTableDateRangeFilterProps = {
  value: DateRangeFilterValue | undefined;
  onChange: (value: DateRangeFilterValue | undefined) => void;
  title: string;
};

export function DataTableDateRangeFilter({
  value,
  onChange,
  title,
}: DataTableDateRangeFilterProps) {
  const mounted = useMounted();

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!(value?.from || value?.to)) {
      return;
    }
    return {
      from: value.from ? new Date(value.from) : undefined,
      to: value.to ? new Date(value.to) : undefined,
    };
  }, [value?.from, value?.to]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!(range?.from || range?.to)) {
      onChange(undefined);
      return;
    }
    onChange({
      from: range.from ? format(range.from, "yyyy-MM-dd") : "",
      to: range.to ? format(range.to, "yyyy-MM-dd") : "",
    });
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const hasFilter = Boolean(value?.from && value?.to);

  const formatDisplayDate = (dateStr: string) =>
    format(new Date(dateStr), "dd.MM");

  const getBadgeText = () => {
    if (value?.from && value?.to) {
      return `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`;
    }
    if (value?.from) {
      return `od ${formatDisplayDate(value.from)}`;
    }
    if (value?.to) {
      return `do ${formatDisplayDate(value.to)}`;
    }
    return "";
  };

  if (!mounted) {
    return (
      <Button className="border-dashed" size="sm" variant="outline">
        <CalendarIcon className="mr-1 h-4 w-4" />
        {title}
      </Button>
    );
  }

  return (
    <ButtonGroup className="*:data-[hidden=true]:hidden [&:has(>[data-hidden=true]:last-child)>*:first-child]:rounded-r-md">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="border-dashed" size="sm" variant="outline">
            <CalendarIcon className="mr-1 h-4 w-4" />
            {title}
            {hasFilter && (
              <Badge className="ml-2" size="xs" variant="secondary">
                {getBadgeText()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={dateRange?.from}
            locale={sk}
            mode="range"
            numberOfMonths={2}
            onSelect={handleSelect}
            selected={dateRange}
            timeZone="Europe/Bratislava"
            weekStartsOn={1}
          />
          <div className={hasFilter ? "border-t p-2" : "hidden"}>
            <Button
              className="w-full"
              onClick={handleClear}
              size="sm"
              variant="ghost"
            >
              Vymazať filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasFilter && (
        <Button
          className="border-dashed"
          onClick={handleClear}
          size="sm"
          variant="outline"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </ButtonGroup>
  );
}
