"use client";

import { type CSSProperties, type ReactNode, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import {
  useContextRailInitialize,
  useContextRailInitialized,
  useContextRailOpen,
} from "@/store/context-rail-store";

const RAIL_WIDTH_PX = 300;

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
  const storeOpen = useContextRailOpen();
  const initialized = useContextRailInitialized();
  const initialize = useContextRailInitialize();
  const open = initialized ? storeOpen : defaultOpen;

  useLayoutEffect(() => {
    if (!initialized) {
      initialize(defaultOpen);
    }
  }, [defaultOpen, initialize, initialized]);

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 overflow-hidden lg:block",
        "transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
        open ? "w-[300px]" : "pointer-events-none w-0"
      )}
      style={{ "--rail-width": `${RAIL_WIDTH_PX}px` } as CSSProperties}
    >
      <div
        className={cn(
          "h-full w-(--rail-width) p-2",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </aside>
  );
}
