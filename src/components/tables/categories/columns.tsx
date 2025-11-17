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
import { fuzzySort } from "@/components/data-table/ui/data-table-search";
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
    header: "Názov",
    enableGlobalFilter: true,
    accessorKey: "name",
    filterFn: "fuzzy",
    sortingFn: fuzzySort,
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
    header: "Stav",
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
    header: "Viditeľná",
    accessorKey: "isVisible",
    cell: ({ row }) => (
      <Badge size="xs" variant={row.original.isVisible ? "default" : "outline"}>
        {row.original.isVisible ? "Viditeľná" : "Neviditeľná"}
      </Badge>
    ),
  },
  {
    header: "Produktov",
    accessorKey: "productsCount",
    cell: ({ row }) => (
      <span className="font-medium text-xs">{row.original.productsCount}</span>
    ),
    size: 16,
  },
  {
    id: "createdAt",
    header: "Vytvorené",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "updatedAt",
    header: "Upravené",
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
            <DropdownMenuItem
              onClick={() => meta?.onDelete(row.original.id)}
              variant="destructive"
            >
              <Trash2Icon />
              Vymazať
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
