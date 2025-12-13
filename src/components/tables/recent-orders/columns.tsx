"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  CopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  VerifiedIcon,
} from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RecentOrder } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";

const ORDER_ID_DISPLAY_LENGTH = 8;

export const columns: ColumnDef<RecentOrder>[] = [
  {
    accessorKey: "orderNumber",
    header: "Objednávka",
    cell: ({ row }) => {
      const id = row.original.id;
      const orderNumber = row.getValue("orderNumber") as string | null;
      return (
        <div className="flex items-center gap-2">
          <Link
            className="font-medium hover:underline"
            href={`/admin/orders/${id}`}
          >
            {orderNumber || id.slice(0, ORDER_ID_DISPLAY_LENGTH)}
          </Link>
          <Button
            className="size-6 p-0"
            disabled={!row.getCanExpand()}
            onClick={row.getToggleExpandedHandler()}
            size="icon"
            variant="ghost"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "customerInfo",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Zákazník"
      />
    ),
    enableSorting: true,
    accessorFn: (row) =>
      row.customerInfo?.name ?? row.createdBy?.name ?? "Guest",
    cell: ({ row }) => {
      const name =
        row.original.customerInfo?.name ||
        row.original.createdBy?.name ||
        "Guest";
      const email =
        row.original.customerInfo?.email ||
        row.original.createdBy?.email ||
        "-";
      const phone =
        row.original.customerInfo?.phone ||
        row.original.createdBy?.phone ||
        "-";

      const isGuest = !row.original.createdBy?.id;
      return (
        <div className="flex flex-col">
          {isGuest ? (
            <div className="flex items-center gap-1">
              <span className="font-medium">{name}</span>
              <Badge size="xs" variant="secondary">
                Guest
              </Badge>
            </div>
          ) : (
            <Link
              className="flex items-center gap-1 font-medium hover:underline"
              href={`/admin/users/${row.original.createdBy?.id}`}
            >
              {name} <VerifiedIcon className="size-3 text-green-500" />
            </Link>
          )}
          <span className="hidden text-muted-foreground text-xs md:inline">
            {email}
          </span>
          <span className="hidden text-muted-foreground text-xs md:inline">
            {phone}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Stav",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      return <Badge variant="outline">{status}</Badge>;
    },
  },
  {
    accessorKey: "store.name",
    enableSorting: true,
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Predajna"
      />
    ),
    cell: ({ row }) => row.original.store?.name ?? "-",
  },
  {
    accessorKey: "pickupDate",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Vyzdvihnúťie"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const pickupDate = row.original.pickupDate;
      const pickupTime = row.original.pickupTime;
      return (
        <div className="flex flex-col">
          <span className="font-medium font-mono text-xs tracking-tighter">
            {pickupDate ? format(pickupDate, "dd.MM.yyyy") : "-"}
          </span>
          <span className="font-medium font-mono text-xs tracking-tighter">
            {pickupTime ? pickupTime : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Dátum vytvorenia"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <span className="font-medium font-mono text-xs tracking-tighter">
          {date ? format(date, "dd.MM.yyyy HH:mm") : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "totalCents",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Spolu (EUR)"
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {formatPrice(row.original.totalCents ?? 0)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="size-8 p-0" variant="ghost">
              <span className="sr-only">Otvoriť menu</span>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              <CopyIcon />
              Kopírovať ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}`}>
                <EyeIcon />
                Zobraziť detaily
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
