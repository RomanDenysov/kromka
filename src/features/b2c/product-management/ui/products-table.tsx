"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { useCreateDraftProduct } from "../hooks/use-product-mutations";
import { AddProductTableButton } from "./add-product-table-button";
import { productsColumns } from "./products-columns";

export type Product = Awaited<
  ReturnType<typeof import("@/actions/products/queries").getProducts>
>[number];

export function ProductsTable() {
  const trpc = useTRPC();
  const [_selectedCategoryId] = useQueryState("categoryId", parseAsString);
  const { data } = useSuspenseQuery(trpc.admin.products.list.queryOptions());
  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const processedProducts = useMemo(() => data, [data]);

  const table = useReactTable({
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns: productsColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="h-full flex-1">
      <DataTable
        columns={productsColumns}
        footer={
          <AddProductTableButton
            loading={isCreatingDraftProduct}
            onClick={() => createDraftProduct()}
          />
        }
        key={processedProducts.length}
        table={table}
      />
    </div>
  );
}
