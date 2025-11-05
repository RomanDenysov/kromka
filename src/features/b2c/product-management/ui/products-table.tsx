"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { useGetSuspenseTableProducts } from "../hooks/use-get-table-products";
import { AddProductTableButton } from "./add-product-table-button";
import { productsColumns } from "./products-columns";

export type Product = Awaited<
  ReturnType<typeof import("@/actions/products/queries").getProducts>
>[number];

export function ProductsTable() {
  const [selectedCategoryId] = useQueryState("categoryId", parseAsString);
  const { data: products } = useGetSuspenseTableProducts();
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
        footer={<AddProductTableButton />}
        table={table}
      />
    </div>
  );
}
