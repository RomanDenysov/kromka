"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PackagePlusIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { productsColumns } from "./products-columns";

export type Product = Awaited<
  ReturnType<typeof import("@/actions/products/queries").getProducts>
>[number];

export function ProductsTable({ products }: { products: Product[] }) {
  const [selectedCategoryId] = useQueryState("categoryId", parseAsString);

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) {
      return products;
    }

    return products.filter((product) =>
      product.categories.some(
        (productCategory) => productCategory.categoryId === selectedCategoryId
      )
    );
  }, [products, selectedCategoryId]);

  const table = useReactTable({
    data: filteredProducts,
    columns: productsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full flex-1">
      <DataTable
        columns={productsColumns}
        footer={
          <Button className="w-full rounded-none" size="xs" variant="ghost">
            <PackagePlusIcon />
            Pridať produkt
          </Button>
        }
        table={table}
      />
    </div>
  );
}
