"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useProductParams } from "@/hooks/use-product-params";
import type { Product } from "@/types/products";
import { columns } from "./columns";

export function ProductsTable({ products }: { products: Product[] }) {
  const { setParams } = useProductParams();
  const table = useReactTable<Product>({
    data: products,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onEdit: (id: string) => {
        setParams({ productId: id });
      },
      onDelete: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: Need to ignore this
        console.log("Delete product", id);
      },
    },
  });

  return (
    <DataTable.Root table={table}>
      <DataTable.Toolbar>
        <DataTable.Search columnId="name" placeholder="Hľadať produkt..." />
        <DataTable.Actions>
          <Button size="sm" variant="outline">
            <PlusIcon className="mr-2 h-4 w-4" />
            Pridať produkt
          </Button>
        </DataTable.Actions>
      </DataTable.Toolbar>
      <DataTable.Content />
      <DataTable.Pagination />
    </DataTable.Root>
  );
}
