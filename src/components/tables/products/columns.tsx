"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, MoreHorizontalIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types/products";

const _MAX_CATEGORIES = 3;

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
      const imagePath = null;
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
  },
  {
    header: "Kategórie",
    accessorKey: "categories",
    cell: ({ row }) => null,
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.original.id}`}>Upraviť</Link>
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
