"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={cn("truncate text-xs", className)}>{title}</div>;
  }

  // Read sorting state directly - component will re-render when table sorting state changes
  const sortedState = column.getIsSorted();

  return (
    <Button
      className={cn("truncate", className)}
      onClick={() => {
        // Read current state at click time to avoid stale closures
        const currentSort = column.getIsSorted();
        column.toggleSorting(currentSort === "asc");
      }}
      size="xs"
      variant="ghost"
    >
      {title}
      {sortedState === "asc" && <ArrowUpIcon className="size-3" />}
      {sortedState === "desc" && <ArrowDownIcon className="size-3" />}
    </Button>
  );
}
