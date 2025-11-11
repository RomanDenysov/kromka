"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { Badge } from "@/components/ui/badge";
import type { RouterOutputs } from "@/trpc/routers";

type Store = RouterOutputs["admin"]["stores"]["list"][number];

export const columns: ColumnDef<Store>[] = [
  {
    header: "Názov",
    accessorKey: "name",
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
