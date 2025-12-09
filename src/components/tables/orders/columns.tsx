"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontalIcon, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
} from "@/lib/constants";
import type { Order } from "@/lib/queries/orders";
import { formatPrice } from "@/lib/utils";

export const columns: ColumnDef<Order>[] = [
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
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Stav"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        size="xs"
        variant={ORDER_STATUS_VARIANTS[row.original.orderStatus]}
      >
        {ORDER_STATUS_LABELS[row.original.orderStatus]}
      </Badge>
    ),
  },
  {
    id: "customer",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Zákazník"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const createdByData = row.original.createdBy;
      const customerData = row.original.customerInfo;

      const name = createdByData?.name ?? customerData?.name;
      const email = createdByData?.email ?? customerData?.email;
      const phone = createdByData?.phone ?? customerData?.phone;

      return (
        <div className="flex flex-col gap-0">
          <span className="truncate font-medium text-xs">{name}</span>
          <span className="truncate text-xs">{email}</span>
          <span className="truncate text-xs">{phone}</span>
        </div>
      );
    },
  },
  {
    id: "store",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Predajňa"
      />
    ),
    enableSorting: true,
    accessorFn: (row) => row.store?.name ?? "",
    cell: ({ row }) => (
      <span className="font-medium text-xs">{row.original.store?.name}</span>
    ),
  },
  {
    id: "total",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Spolu (EUR)"
      />
    ),
    enableSorting: true,
    accessorKey: "totalCents",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {formatPrice(row.original.totalCents ?? 0)}
      </span>
    ),
  },
  {
    id: "paymentMethod",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Metóda platby"
      />
    ),
    enableSorting: true,
    accessorKey: "paymentMethod",
    cell: ({ row }) => {
      const Icon = PAYMENT_METHOD_ICONS[row.original.paymentMethod];
      return (
        <Badge size="xs" variant="outline">
          <Icon />
          {PAYMENT_METHOD_LABELS[row.original.paymentMethod]}
        </Badge>
      );
    },
  },
  {
    id: "paymentStatus",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Stav platby"
      />
    ),
    enableSorting: true,
    accessorKey: "paymentStatus",
    cell: ({ row }) => (
      <Badge
        size="xs"
        variant={PAYMENT_STATUS_VARIANTS[row.original.paymentStatus]}
      >
        {PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
      </Badge>
    ),
  },
  {
    id: "pickupDate",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Vyzdvihnúťie"
      />
    ),
    enableSorting: true,
    accessorKey: "pickupDate",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium font-mono text-xs tracking-tighter">
          {row.original.pickupDate
            ? format(row.original.pickupDate, "dd.MM.yyyy")
            : "Neurčený"}
        </span>
        <span className="font-medium font-mono text-xs tracking-tighter">
          {row.original.pickupTime ? row.original.pickupTime : "Neurčený"}
        </span>
      </div>
    ),
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Aktualizované"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {format(row.original.updatedAt, "dd.MM.yyyy HH:mm")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}`} prefetch>
                <SquareArrowOutUpRight />
                Otvoriť
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
