"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, MoreHorizontalIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/products";

const MAX_CATEGORIES = 3;

type ProductTableMeta = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const columns: ColumnDef<Product, ProductTableMeta>[] = [
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
    header: "Produkt",
    accessorKey: "name",
    cell: ({ row }) => {
      const product = row.original;
      const imagePath = product.images[0]?.media?.path;
      return (
        <div className="flex items-center gap-3">
          {imagePath ? (
            <Image
              alt={product.name}
              className="rounded-md object-cover"
              height={64}
              src={imagePath}
              width={64}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-md bg-muted">
              <ImageIcon className="size-5" />
            </div>
          )}
          <span className="font-medium text-sm">{product.name}</span>
        </div>
      );
    },
  },
  {
    header: "Cena",
    accessorKey: "prices",
    cell: ({ row }) =>
      row.original.prices.map((price) => (
        <div key={price.id}>{formatPrice(price.amountCents)}</div>
      )),
  },
  {
    header: "Kategórie",
    accessorKey: "categories",
    cell: ({ row }) =>
      row.original.categories.slice(0, MAX_CATEGORIES).map((category) => (
        <Badge className="mr-0.5" key={category.category.id} size="xs">
          {category.category.name}
        </Badge>
      )),
  },
  {
    header: "Stav",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge className="capitalize" size="xs">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
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
            <DropdownMenuItem onClick={() => meta?.onEdit?.(row.original.id)}>
              Upraviť
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive/80"
              onClick={() => meta?.onDelete?.(row.original.id)}
            >
              Vymazať
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
