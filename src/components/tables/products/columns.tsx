"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { RouterOutputs } from "@/trpc/routers";

const MAX_CATEGORIES = 3;

export type Product = RouterOutputs["admin"]["products"]["list"][number];

export const columns: ColumnDef<Product>[] = [
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
    header: "Názov",
    accessorKey: "name",
    cell: ({ row }) => (
      <Link
        className="font-medium text-xs hover:underline"
        href={`/admin/b2c/products/${row.original.id}`}
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    header: "Cena",
    accessorKey: "prices",
    cell: ({ row }) =>
      row.original.prices.map((price) => (
        <div key={price.id}>{price.amountCents}</div>
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
];
