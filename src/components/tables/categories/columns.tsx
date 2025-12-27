"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import {
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SparklesIcon,
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAdminCategoriesLink } from "@/hooks/use-category-params";
import type { AdminCategory } from "@/lib/queries/categories";

type CategoryTableMeta = {
  toggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  toggleFeatured: (id: string) => void;
};

export const columns: ColumnDef<AdminCategory, CategoryTableMeta>[] = [
  {
    id: "select",
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
    enableSorting: false,
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Názov"
      />
    ),
    meta: {
      label: "Názov",
      variant: "text",
    },
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Link
          className={buttonVariants({ variant: "link", size: "xs" })}
          href={getAdminCategoriesLink({ categoryId: row.original.id })}
        >
          {row.original.name}
        </Link>
        {row.original.isFeatured && (
          <Badge
            className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            size="xs"
            variant="outline"
          >
            <SparklesIcon className="size-3" />
          </Badge>
        )}
      </div>
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
    meta: {
      label: "Stav",
      variant: "multiSelect",
      options: [
        { label: "Aktívna", value: "active" },
        { label: "Neaktívna", value: "inactive" },
      ],
    },
    accessorKey: "isActive",
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      const rowValue = String(row.getValue(columnId));
      return filterValue.includes(rowValue);
    },
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
    meta: {
      label: "Viditeľná",
      variant: "multiSelect",
      options: [
        { label: "Viditeľná", value: "visible" },
        { label: "Neviditeľná", value: "invisible" },
      ],
    },
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
    meta: {
      label: "Katalog",
      variant: "multiSelect",
      options: [
        { label: "B2C", value: "b2c" },
        { label: "B2B", value: "b2b" },
      ],
    },
    accessorKey: "showInB2b",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">
        {row.original.showInB2c && row.original.showInB2b
          ? "B2C, B2B"
          : // biome-ignore lint/style/noNestedTernary: Simple channel selection
            row.original.showInB2c
            ? "B2C"
            : "B2B"}
      </span>
    ),
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
    meta: {
      label: "Produktov",
      variant: "number",
    },
    accessorKey: "products",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {row.original.products.length}ks
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
    meta: {
      label: "Upravené",
      variant: "date",
    },
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
    enableSorting: false,
    size: 32,
    enableHiding: false,
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
              <Link
                href={getAdminCategoriesLink({ categoryId: row.original.id })}
              >
                <PencilIcon />
                Upraviť
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onCopy(row.original.id)}>
              <CopyIcon />
              Kopírovať
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.toggleFeatured(row.original.id)}
            >
              <SparklesIcon />
              {row.original.isFeatured ? "Zrušiť" : "Zvýrazniť"}
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
