"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setContextRailOpenAction } from "@/features/daily-view-sidebar/api/actions";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { cn } from "@/lib/utils";
import {
  useContextRailInitialized,
  useContextRailOpen,
  useContextRailSetOpen,
} from "@/store/context-rail-store";

interface DashboardDateChipProps {
  defaultRailOpen: boolean;
}

export function DashboardDateChip({ defaultRailOpen }: DashboardDateChipProps) {
  const [{ date }] = useDashboardParams();
  const storeOpen = useContextRailOpen();
  const initialized = useContextRailInitialized();
  const setOpen = useContextRailSetOpen();
  const railOpen = initialized ? storeOpen : defaultRailOpen;

  const toggleRail = () => {
    const next = !railOpen;
    setOpen(next);
    // biome-ignore lint/complexity/noVoid: persist preference via fire-and-forget server action
    void setContextRailOpenAction(next);
  };

  return (
    <Button
      aria-expanded={railOpen}
      aria-label={railOpen ? "Skryť denný prehľad" : "Otvoriť denný prehľad"}
      className={cn(
        "h-7 gap-1 px-2 font-medium text-xs",
        railOpen && "bg-accent text-accent-foreground"
      )}
      onClick={toggleRail}
      size="sm"
      variant="outline"
    >
      <CalendarIcon className="size-3 text-muted-foreground" />
      <span className="capitalize tabular-nums">
        {format(date, "d. MMM", { locale: sk })}
      </span>
    </Button>
  );
}
