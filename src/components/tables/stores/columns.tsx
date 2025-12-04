"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Store } from "@/lib/queries/stores";

type StoreTableMeta = {
  toggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
};

export const columns: ColumnDef<Store, StoreTableMeta>[] = [
  {
    id: "name",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Názov"
      />
    ),
    enableGlobalFilter: true,
    accessorKey: "name",
    filterFn: "fuzzy",
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        className={buttonVariants({ variant: "link", size: "xs" })}
        href={`/admin/stores/${row.original.id}`}
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Stav"
      />
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta as StoreTableMeta;
      return (
        <Button
          className="cursor-pointer"
          onClick={() => meta?.toggleActive(row.original.id)}
          size="xs"
          variant="secondary"
        >
          {row.original.isActive ? (
            <>
              <CheckIcon className="size-3" />
              Aktívny
            </>
          ) : (
            <>
              <XIcon className="size-3" />
              Neaktívny
            </>
          )}
        </Button>
      );
    },
  },
  {
    id: "customers",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Zákazníci"
      />
    ),
    enableSorting: true,
    accessorKey: "usersCount",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {row.original.users.length}
      </span>
    ),
  },
  {
    id: "orders",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Objednávky"
      />
    ),
    enableSorting: true,
    accessorKey: "ordersCount",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {row.original.orders.length}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const meta = table.options.meta as StoreTableMeta;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/stores?storeId=${row.original.id}`} prefetch>
                <PencilIcon />
                Upraviť
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onCopy(row.original.id)}>
              <CopyIcon />
              Kopírovať
            </DropdownMenuItem>
            <AlertDialog key={`delete-${row.original.id}`}>
              <DropdownMenuItem asChild asDialogTrigger variant="destructive">
                <AlertDialogTrigger className="w-full">
                  <Trash2Icon />
                  Vymazať
                </AlertDialogTrigger>
              </DropdownMenuItem>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť obchod</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť obchod? Táto akcia je nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => meta?.onDelete(row.original.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Odstrániť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
