"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/utils";
import type { TableOrder } from "./table";

export const columns: ColumnDef<TableOrder>[] = [
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
    id: "orderNumber",
    accessorKey: "orderNumber",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Objednávka"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        className="font-medium text-xs underline-offset-2 hover:underline"
        href={`/admin/orders/${row.original.id}`}
        prefetch
      >
        #{row.original.orderNumber}
      </Link>
    ),
  },
  {
    id: "status",
    accessorKey: "orderStatus",
    header: "Stav",
    cell: ({ row }) => (
      <Badge size="xs" variant="outline">
        {row.original.orderStatus}
      </Badge>
    ),
  },
  {
    id: "customer",
    header: "Zákazník",
    accessorFn: (row) =>
      row.createdBy?.name || row.createdBy?.email || "Neznámy zákazník",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {row.original.createdBy?.name || row.original.createdBy?.email}
      </span>
    ),
  },
  {
    id: "store",
    header: "Predajňa",
    accessorFn: (row) => row.store?.name ?? "",
    cell: ({ row }) => (
      <span className="font-medium text-xs">{row.original.store?.name}</span>
    ),
  },
  {
    id: "total",
    header: "Spolu (EUR)",
    accessorKey: "totalCents",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {formatPrice(row.original.totalCents ?? 0)}
      </span>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Vytvorené"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy HH:mm")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        aria-label="Detail objednávky"
        asChild
        className="ml-auto"
        size="icon-xs"
        variant="ghost"
      >
        <Link href={`/admin/orders/${row.original.id}`} prefetch>
          <ChevronRightIcon />
        </Link>
      </Button>
    ),
  },
];
