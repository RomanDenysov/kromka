"use client";

import { CalendarDaysIcon, PanelRightCloseIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { setContextRailOpenAction } from "@/features/daily-view-sidebar/api/actions";

interface ContextRailShellProps {
  children: ReactNode;
  defaultOpen: boolean;
}

/**
 * In-flow wrapper for the admin right-hand context rail.
 *
 * Renders as a real flex child (fixed width + `shrink-0`) so it always reserves
 * its own horizontal space and can never overlap the main content.
 *
 * Initial state comes from the server (cookie), so the first paint is already
 * correct — no hydration flash. Toggling updates local state instantly and
 * persists the cookie in the background.
 */
export function ContextRailShell({
  defaultOpen,
  children,
}: ContextRailShellProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = (next: boolean) => {
    setOpen(next);
    // biome-ignore lint/complexity/noVoid: persist preference via fire-and-forget server action
    void setContextRailOpenAction(next);
  };

  if (!open) {
    return (
      <div className="sticky top-0 hidden h-fit shrink-0 p-2 lg:block">
        <Button
          aria-label="Otvoriť denný prehľad"
          className="size-9"
          onClick={() => toggle(true)}
          size="icon"
          variant="outline"
        >
          <CalendarDaysIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="sticky top-0 hidden h-svh w-[300px] shrink-0 p-2 lg:block">
      <div className="relative h-full">
        <Button
          aria-label="Skryť denný prehľad"
          className="absolute top-2 right-2 z-10 size-7 bg-card/90 backdrop-blur-sm"
          onClick={() => toggle(false)}
          size="icon"
          variant="ghost"
        >
          <PanelRightCloseIcon className="size-3.5" />
        </Button>
        {children}
      </div>
    </aside>
  );
}
