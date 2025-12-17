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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus, PaymentStatus } from "@/db/types";
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

type OrdersTableMeta = {
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  onPaymentStatusChange: (id: string, status: PaymentStatus) => Promise<void>;
};

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
    meta: {
      label: "Číslo objednávky",
      variant: "text",
    },
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
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
    meta: {
      label: "Stav",
      variant: "multiSelect",
      options: Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
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
    meta: {
      label: "Zákazník",
      variant: "text",
    },
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
    meta: {
      label: "Predajňa",
      variant: "text",
    },
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
    meta: {
      label: "Spolu (EUR)",
      variant: "text",
    },
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
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
    meta: {
      label: "Metóda platby",
      variant: "multiSelect",
      options: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
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
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
    meta: {
      label: "Stav platby",
      variant: "multiSelect",
      options: Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
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
    meta: {
      label: "Vyzdvihnúťie",
      variant: "text",
    },
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
    meta: {
      label: "Aktualizované",
      variant: "text",
    },
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {format(row.original.updatedAt, "dd.MM.yyyy HH:mm")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const meta = table.options.meta as OrdersTableMeta;
      const onStatusChange = meta?.onStatusChange;
      const onPaymentStatusChange = meta?.onPaymentStatusChange;
      const order = row.original;
      const orderStatuses = Object.entries(ORDER_STATUS_LABELS).map(
        ([value, label]) => ({
          label,
          value,
        })
      ) as { label: string; value: OrderStatus }[];
      const currentOrderStatus = order.orderStatus;
      const isCurrentOrderStatus = (status: OrderStatus) =>
        status === currentOrderStatus;

      const paymentStatuses = Object.entries(PAYMENT_STATUS_LABELS).map(
        ([value, label]) => ({
          label,
          value,
        })
      ) as { label: string; value: PaymentStatus }[];
      const currentPaymentStatus = order.paymentStatus;
      const isCurrentPaymentStatus = (status: PaymentStatus) =>
        status === currentPaymentStatus;
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
            <DropdownMenuItem asChild>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Stav objednávky</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {orderStatuses.map((status) => (
                      <DropdownMenuCheckboxItem
                        checked={isCurrentOrderStatus(status.value)}
                        key={status.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onStatusChange(order.id, status.value);
                          }
                        }}
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Stav platby</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {paymentStatuses.map((status) => (
                      <DropdownMenuCheckboxItem
                        checked={isCurrentPaymentStatus(status.value)}
                        key={status.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onPaymentStatusChange(order.id, status.value);
                          }
                        }}
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
