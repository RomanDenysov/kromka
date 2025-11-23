"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDownIcon,
  ChevronDown,
  ChevronRight,
  CopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { getRecentOrders } from "@/db/queries/dashboard";
import { formatPrice } from "@/lib/utils";

type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];

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
    accessorKey: "createdBy.name",
    header: "Zákazník",
    cell: ({ row }) => {
      const name = row.original.createdBy?.name || "Guest";
      const email = row.original.createdBy?.email;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          {email && (
            <span className="hidden text-muted-foreground text-xs md:inline">
              {email}
            </span>
          )}
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
    header: "Predajna",
    cell: ({ row }) => row.original.store?.name ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "Dátum",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "totalCents",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Celková suma
          <ArrowUpDownIcon className="ml-2 size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatPrice(row.original.totalCents ?? 0)}
      </div>
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
