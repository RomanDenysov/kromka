/** biome-ignore-all lint/correctness/noUndeclaredVariables: Ignore it for now */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckIcon,
  CircleIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import { Hint } from "@/components/shared/hint";
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
import { formatPrice } from "@/lib/utils";
import type { TableProduct } from "./table";

const _MAX_CATEGORIES_DISPLAY = 3;

type ProductTableMeta = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleActive: (id: string) => void;
};

export const columns: ColumnDef<TableProduct, ProductTableMeta>[] = [
  {
    id: "select",
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Produkt"
      />
    ),
    accessorKey: "name",
    filterFn: "fuzzy",
    enableSorting: true,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Link
          className={buttonVariants({ variant: "link", size: "xs" })}
          href={`/admin/products/${product.id}`}
          prefetch
        >
          {product.name}
        </Link>
      );
    },
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Status"
      />
    ),
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge className="capitalize" size="xs">
        <CircleIcon className="size-3" />
        {row.original.status}
      </Badge>
    ),
    enableGlobalFilter: true,
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
    enableSorting: true,
    cell: ({ row, table }) => {
      const meta = table.options.meta as ProductTableMeta;
      return (
        <Button
          className="cursor-pointer"
          onClick={() => meta?.onToggleActive(row.original.id)}
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
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Cena"
      />
    ),
    accessorKey: "priceCents",
    cell: ({ row }) => {
      const prices = row.original.prices;
      return prices.length > 0 ? (
        <Hint text={prices.map((price) => price.priceTier.name).join(", ")}>
          <span className="font-medium text-xs">
            {formatPrice(row.original.priceCents)}
          </span>
        </Hint>
      ) : (
        <span className="font-medium text-xs">
          {formatPrice(row.original.priceCents)}
        </span>
      );
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Kategórie"
      />
    ),
    accessorKey: "categories",
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? (
        <Badge size="xs" variant="outline">
          {category.name}
        </Badge>
      ) : null;
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Katalog"
      />
    ),
    accessorKey: "showInB2cAndB2b",
    cell: ({ row }) => {
      const channels =
        row.original.showInB2c && row.original.showInB2b
          ? ["B2C", "B2B"]
          : // biome-ignore lint/style/noNestedTernary: Ignore it for now
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
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Vytvorené"
      />
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as ProductTableMeta;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.original.id}`}>
                <PencilIcon />
                Upraviť
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onCopy?.(row.original.id)}>
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
                  <AlertDialogTitle>Odstrániť produkt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť produkt? Táto akcia je nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => meta?.onDelete?.(row.original.id)}
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
