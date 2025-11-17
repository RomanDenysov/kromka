"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PackagePlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateDraftProduct } from "@/hooks/mutations/use-create-draft-product";
import { useProductParams } from "@/hooks/use-product-params";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";

export type TableProduct = RouterOutputs["admin"]["products"]["list"][number];

export function ProductsTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.products.list.queryOptions());

  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const copyProduct = useMutation(
    trpc.admin.products.copyProduct.mutationOptions({
      onSuccess: ({ id }) => {
        router.push(`/admin/products/${id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const processedProducts = useMemo(() => data ?? [], [data]);

  const { setParams } = useProductParams();
  const table = useReactTable<TableProduct>({
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onEdit: (id: string) => {
        setParams({ productId: id });
      },
      onCopy: (id: string) => {
        copyProduct.mutate({ productId: id });
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
          <Button
            disabled={isCreatingDraftProduct}
            onClick={() => createDraftProduct()}
            size="sm"
            variant="outline"
          >
            {isCreatingDraftProduct ? (
              <>
                <Spinner /> Pridávame produkt...
              </>
            ) : (
              <>
                <PackagePlusIcon /> Pridať produkt
              </>
            )}
          </Button>
        </DataTable.Actions>
      </DataTable.Toolbar>
      <DataTable.Content />
      <DataTable.Pagination />
    </DataTable.Root>
  );
}
