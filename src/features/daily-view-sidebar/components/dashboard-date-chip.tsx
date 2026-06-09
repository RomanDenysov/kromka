"use client";

import { format, isToday } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { DashboardCalendar } from "./dashboard-calendar";

interface DailyStats {
  [date: string]: { orderCount: number; revenue: number };
}

interface DashboardDateChipProps {
  dailyStats: DailyStats;
  orderCount: number;
}

export function DashboardDateChip({
  dailyStats,
  orderCount,
}: DashboardDateChipProps) {
  const [{ date }] = useDashboardParams();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-8 gap-2 px-2.5 font-normal text-sm"
          variant="outline"
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          <span className="capitalize">
            {format(date, "EEE d. M. yyyy", { locale: sk })}
          </span>
          <Badge size="xs" variant="secondary">
            {orderCount} obj.
          </Badge>
          {isToday(date) ? (
            <Badge className="text-[10px]" size="xs" variant="outline">
              Dnes
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <DashboardCalendar dailyStats={dailyStats} />
      </PopoverContent>
    </Popover>
  );
}
