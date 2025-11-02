"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RowToggleButton } from "@/widgets/data-table/ui/row-toggle-button";
import { useUpdateProductState } from "../hooks/use-update-product-state";
import type { Product } from "./products-table";

const MAX_CATEGORIES = 3;

function ProductActiveCell({ product }: { product: Product }) {
  const updateProductState = useUpdateProductState();

  const handleToggle = useCallback(() => {
    updateProductState.mutate(product.id);
  }, [updateProductState, product.id]);

  const optimisticIsActive = updateProductState.isPending
    ? !product.isActive
    : product.isActive;

  return (
    <RowToggleButton
      disabled={updateProductState.isPending}
      isActive={optimisticIsActive}
      onToggle={handleToggle}
      size="xs"
    />
  );
}

export const productsColumns: ColumnDef<Product>[] = [
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
  {
    header: "Aktívny",
    accessorKey: "isActive",
    cell: ({ row }) => <ProductActiveCell product={row.original} />,
    size: 20,
    enableSorting: false,
    enableHiding: false,
  },
];
