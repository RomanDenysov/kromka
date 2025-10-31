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
    return (
      <div className={cn("truncate text-muted-foreground text-sm", className)}>
        {title}
      </div>
    );
  }
  return (
    <Button
      className={cn("truncate text-muted-foreground", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="sm"
      variant="ghost"
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUpIcon />
      ) : (
        column.getIsSorted() === "desc" && <ArrowDownIcon />
      )}
    </Button>
  );
}
