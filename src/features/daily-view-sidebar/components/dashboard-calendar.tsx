"use client";

import { format } from "date-fns";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { cn } from "@/lib/utils";

const DEFAULT_NUMBER_OF_MONTHS = 1;

interface DailyStats {
  [date: string]: { orderCount: number; revenue: number };
}

interface Props {
  dailyStats: DailyStats;
}

export function DashboardCalendar({ dailyStats }: Props) {
  const [{ date }, setSearchParams] = useDashboardParams();

  return (
    <Calendar
      captionLayout="dropdown"
      className="w-full bg-transparent p-2 [--cell-size:2.125rem]"
      classNames={{
        month: "w-full gap-3",
        month_caption: "px-0",
        weekdays: "flex w-full gap-1",
        weekday:
          "flex-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
        week: "mt-1 flex w-full gap-1",
        day: "min-w-0 flex-1 p-0",
        today: "bg-transparent",
        outside: "opacity-35",
      }}
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const formattedDayDate = format(day.date, "yyyy-MM-dd");
          const stats = dailyStats[formattedDayDate];
          const orderCount = stats?.orderCount ?? 0;
          const hasOrders = orderCount > 0;
          const isSelected = modifiers.selected;
          const isToday = modifiers.today;

          return (
            <CalendarDayButton
              day={day}
              modifiers={modifiers}
              {...props}
              className={cn(
                "aspect-auto size-auto h-10 min-h-10 w-full gap-0 rounded-md border border-transparent p-0",
                "[&>span]:font-medium [&>span]:text-xs [&>span]:opacity-100",
                !(isSelected || modifiers.outside) &&
                  "hover:border-border hover:bg-accent/50",
                hasOrders &&
                  !isSelected &&
                  "border-primary/30 bg-primary/10 hover:border-primary/40 hover:bg-primary/15",
                isToday &&
                  !isSelected &&
                  "border-primary/50 font-semibold ring-1 ring-primary/25"
              )}
            >
              {children}
              {!modifiers.outside && hasOrders ? (
                <span
                  className={cn(
                    "font-semibold text-[10px] tabular-nums leading-none",
                    isSelected ? "text-primary-foreground/85" : "text-primary"
                  )}
                >
                  {orderCount}
                </span>
              ) : null}
            </CalendarDayButton>
          );
        },
      }}
      defaultMonth={date}
      formatters={{
        formatMonthDropdown: (d) => d.toLocaleString("sk", { month: "long" }),
      }}
      mode="single"
      numberOfMonths={DEFAULT_NUMBER_OF_MONTHS}
      onSelect={(d) => setSearchParams({ date: d })}
      selected={date}
      timeZone="Europe/Bratislava"
      weekStartsOn={1}
    />
  );
}
