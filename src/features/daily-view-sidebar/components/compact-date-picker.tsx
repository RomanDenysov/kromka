"use client";

import { addDays, format, isToday } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { cn } from "@/lib/utils";
import { DashboardCalendar } from "./dashboard-calendar";

interface DailyStats {
  [date: string]: { orderCount: number; revenue: number };
}

interface CompactDatePickerProps {
  dailyStats: DailyStats;
}

export function CompactDatePicker({ dailyStats }: CompactDatePickerProps) {
  const [{ date }, setSearchParams] = useDashboardParams();
  const todaySelected = isToday(date);

  return (
    <div className="flex items-center gap-1 border-b px-1 py-2">
      <Button
        aria-label="Predchádzajúci deň"
        className="size-7 shrink-0"
        onClick={() => setSearchParams({ date: addDays(date, -1) })}
        size="icon"
        variant="ghost"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="h-7 min-w-0 flex-1 gap-1.5 px-2 font-medium text-xs"
            variant="ghost"
          >
            <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate capitalize">
              {format(date, "EEE d. M.", { locale: sk })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto p-0">
          <DashboardCalendar dailyStats={dailyStats} />
        </PopoverContent>
      </Popover>

      <Button
        aria-label="Nasledujúci deň"
        className="size-7 shrink-0"
        onClick={() => setSearchParams({ date: addDays(date, 1) })}
        size="icon"
        variant="ghost"
      >
        <ChevronRightIcon className="size-4" />
      </Button>

      <Button
        className={cn(
          "h-7 shrink-0 px-2 text-xs",
          todaySelected && "pointer-events-none invisible"
        )}
        onClick={() => setSearchParams({ date: new Date() })}
        size="sm"
        variant="outline"
      >
        Dnes
      </Button>
    </div>
  );
}
