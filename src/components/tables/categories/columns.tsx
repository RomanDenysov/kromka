"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import {
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/ui/table-column-header";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TableCategory } from "./table";

type CategoryTableMeta = {
  toggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
};

export const columns: ColumnDef<TableCategory, CategoryTableMeta>[] = [
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
        href={`/admin/categories/${row.original.id}`}
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Stav"
      />
    ),
    accessorKey: "isActive",
    cell: ({ row, table }) => {
      const meta = table.options.meta as CategoryTableMeta;
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
              Aktívna
            </>
          ) : (
            <>
              <XIcon className="size-3" />
              Neaktívna
            </>
          )}
        </Button>
      );
    },
  },
  {
    id: "isVisible",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Viditeľná"
      />
    ),
    accessorKey: "isVisible",
    cell: ({ row }) => (
      <Badge
        size="xs"
        variant={row.original.showInMenu ? "default" : "outline"}
      >
        {row.original.showInMenu ? "Viditeľná" : "Neviditeľná"}
      </Badge>
    ),
  },
  {
    id: "catalog",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Katalog"
      />
    ),
    enableSorting: true,
    accessorKey: "showInB2b",
    filterFn: "fuzzy",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const channels =
        row.original.showInB2c && row.original.showInB2b
          ? ["B2C", "B2B"]
          : // biome-ignore lint/style/noNestedTernary: <explanation>
            row.original.showInB2c
            ? ["B2C"]
            : ["B2B"];
      return (
        <span className="font-medium font-mono text-xs">
          {channels.map((channel) => channel.toUpperCase()).join(", ")}
        </span>
      );
    },
  },
  {
    id: "productsCount",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Produktov"
      />
    ),
    accessorKey: "productsCount",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {row.original.productsCount}ks
      </span>
    ),
    size: 16,
  },
  {
    id: "updatedAt",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Upravené"
      />
    ),
    accessorKey: "updatedAt",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.updatedAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const meta = table.options.meta as CategoryTableMeta;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${row.original.id}`} prefetch>
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
                  <AlertDialogTitle>Odstrániť kategóriu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť kategóriu? Táto akcia je nevratná.
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
