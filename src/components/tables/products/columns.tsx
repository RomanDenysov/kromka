"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CircleIcon,
  CopyIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

const MAX_CATEGORIES_DISPLAY = 3;

type ProductTableMeta = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
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
    id: "image",
    header: "",
    accessorKey: "images",
    cell: ({ row }) => {
      const product = row.original;
      const imgPath = product.images[0] ?? null;
      return (
        <div className="flex items-center gap-2">
          {imgPath ? (
            <Image
              alt={product.name}
              className="rounded-md object-cover"
              height={64}
              src={imgPath}
              width={64}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-md bg-muted">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    header: "Produkt",
    accessorKey: "name",
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
  },
  {
    header: "Stav",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge className="capitalize" size="xs">
        <CircleIcon className="size-3" />
        {row.original.status}
      </Badge>
    ),
  },
  {
    header: "Cena",
    accessorKey: "prices",
    cell: ({ row }) => {
      const prices = row.original.prices;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {prices.map((price) => (
            <span className="font-medium text-xs" key={price.id}>
              {/** biome-ignore lint/style/noMagicNumbers: <explanation> */}
              {formatPrice(price.amountCents / 100)}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    header: "Kategórie",
    accessorKey: "categories",
    cell: ({ row }) => {
      const categories = row.original.categories;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {categories.slice(0, MAX_CATEGORIES_DISPLAY).map((category) => (
            <Badge
              className="truncate capitalize"
              key={category.id}
              size="xs"
              variant={"outline"}
            >
              {category.name}
            </Badge>
          ))}
          {categories.length > MAX_CATEGORIES_DISPLAY && (
            <Badge size="xs" variant="outline">
              +{categories.length - MAX_CATEGORIES_DISPLAY}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: "Katalog",
    accessorKey: "channels",
    cell: ({ row }) => {
      const channels = row.original.channels;
      return (
        <span className="font-medium font-mono text-xs">
          {channels.map((channel) => channel.toUpperCase()).join(", ")}
        </span>
      );
    },
  },
  {
    header: "Vytvorené",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
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
              <Link href={`/admin/products/${row.original.id}`}>
                <PencilIcon />
                Upraviť
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onCopy?.(row.original.id)}>
              <CopyIcon />
              Kopírovať
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(row.original.id)}
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
