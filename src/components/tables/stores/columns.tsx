"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/store";

export const columns: ColumnDef<Store>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 32,
  },
  {
    header: "Názov",
    accessorKey: "name",
    cell: ({ row }) => (
      <Link
        className={cn(buttonVariants({ variant: "link", size: "xs" }))}
        href={`/admin/stores?storeId=${row.original.id}` as Route}
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    header: "Stav",
    accessorKey: "isActive",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Aktívny" : "Neaktívny"}
      </Badge>
    ),
  },
  {
    header: "Vytvorené",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
];
