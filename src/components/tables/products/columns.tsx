/** biome-ignore-all lint/correctness/noUndeclaredVariables: Ignore it for now */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckIcon,
  CircleIcon,
  CopyIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import type { AdminProduct } from "@/features/products/api/queries";
import { formatPrice } from "@/lib/utils";
import { TableColumnHeader } from "@/widgets/data-table/table-column-header";

export type ProductTableMeta = {
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleActive: (id: string) => void;
};

export const columns: ColumnDef<AdminProduct, ProductTableMeta>[] = [
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
    id: "image",
    header: "Obrázok",
    meta: {
      label: "Obrázok",
      variant: "text",
    },
    accessorKey: "images",
    cell: ({ row }) => {
      const product = row.original;
      const image = product.imageUrl;
      return image ? (
        <Image
          alt={product.name}
          className="rounded-sm"
          height={60}
          quality={60}
          src={image}
          width={60}
        />
      ) : (
        <div className="flex size-[60px] items-center justify-center rounded-sm bg-muted">
          <ImageIcon className="size-6 stroke-2 text-muted-foreground" />
        </div>
      );
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Produkt"
      />
    ),
    meta: {
      label: "Produkt",
      variant: "text",
    },
    accessorKey: "name",
    enableSorting: true,
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Link
          className={buttonVariants({ variant: "link", size: "xs" })}
          href={`/admin/products?productId=${product.id}`}
        >
          {product.name}
        </Link>
      );
    },
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
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Návrh", value: "draft" },
        { label: "Aktívny", value: "active" },
        { label: "Predaný", value: "sold" },
        { label: "Archivovaný", value: "archived" },
      ],
    },
    enableGlobalFilter: true,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
    cell: ({ row }) => (
      <Badge className="capitalize" size="xs">
        <CircleIcon className="size-3" />
        {row.original.status}
      </Badge>
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
    enableSorting: true,
    meta: {
      label: "Stav",
      variant: "multiSelect",
      options: [
        { label: "Aktívny", value: "true" },
        { label: "Neaktívny", value: "false" },
      ],
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      const rowValue = String(row.getValue(columnId));
      return filterValue.includes(rowValue);
    },
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
    meta: {
      label: "Cena",
      variant: "number",
    },
    accessorKey: "priceCents",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {formatPrice(row.original.priceCents)}
      </span>
    ),
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Kategórie"
      />
    ),
    meta: {
      label: "Kategórie",
      variant: "text",
    },
    accessorKey: "categories",
    enableSorting: true,
    enableGlobalFilter: true,
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
    meta: {
      label: "Katalog",
      variant: "multiSelect",
      options: [
        { label: "B2C", value: "b2c" },
        { label: "B2B", value: "b2b" },
      ],
    },
    accessorKey: "showInB2cAndB2b",
    enableSorting: true,
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
    meta: {
      label: "Vytvorené",
      variant: "date",
    },
    accessorKey: "createdAt",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
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
