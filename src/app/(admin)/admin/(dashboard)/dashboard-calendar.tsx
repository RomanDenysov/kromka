/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import { format } from "date-fns";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { cn } from "@/lib/utils";

type DailyStats = {
  [date: string]: { orderCount: number; revenue: number };
};

type Props = {
  dailyStats: DailyStats;
};

export function DashboardCalendar({ dailyStats }: Props) {
  const [{ date }, setSearchParams] = useDashboardParams();

  return (
    <Calendar
      captionLayout="dropdown"
      className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const formattedDayDate = format(day.date, "yyyy-MM-dd");
          const stats = dailyStats[formattedDayDate];
          const hasOrders = stats?.orderCount > 0;
          return (
            <CalendarDayButton
              day={day}
              modifiers={modifiers}
              {...props}
              className={cn(
                "justify-start p-1.5",
                hasOrders && "bg-muted text-primary"
              )}
            >
              {children}
              {!modifiers.outside && stats && (
                <span className="text-[10px] data-[selected-single=true]:bg-primary-foreground">
                  {stats.orderCount > 0 ? `${stats.orderCount}` : ""}
                </span>
              )}
            </CalendarDayButton>
          );
        },
      }}
      defaultMonth={date}
      formatters={{
        formatMonthDropdown: (d) => d.toLocaleString("sk", { month: "long" }),
      }}
      mode="single"
      numberOfMonths={1}
      onSelect={(d) => setSearchParams({ date: d })}
      selected={date}
      timeZone="Europe/Bratislava"
      weekStartsOn={1}
    />
  );
}
