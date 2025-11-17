"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  FileIcon,
  PackagePlusIcon,
  Table2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { setParams } = useProductParams();

  const processedProducts = useMemo(() => data ?? [], [data]);

  const table = useReactTable<TableProduct>({
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
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

  const handleExport = (format: "csv" | "xlsx") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const exportData = selectedRows.length
      ? selectedRows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original);

    // TODO: Implement export via XLSX or CSV based on the format
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("Exporting:", exportData);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("Format:", format);
  };

  return (
    <DataTable.Root table={table}>
      <DataTable.Toolbar>
        <DataTable.Search columnId="name" placeholder="Hľadať produkt..." />
        <DataTable.Actions>
          <DataTable.Filter columnId="status">
            {({ value, onChange }) => (
              <div className="flex gap-1">
                <Button
                  onClick={() =>
                    onChange(value === "active" ? undefined : "active")
                  }
                  size="sm"
                  variant={value === "active" ? "default" : "outline"}
                >
                  Active
                </Button>
                <Button
                  onClick={() =>
                    onChange(value === "draft" ? undefined : "draft")
                  }
                  size="sm"
                  variant={value === "draft" ? "default" : "outline"}
                >
                  Draft
                </Button>
              </div>
            )}
          </DataTable.Filter>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowDownIcon /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileIcon /> CSV format
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                <Table2Icon /> XLSX format
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DataTable.Actions>
      </DataTable.Toolbar>
      <DataTable.Content />
      <DataTable.Pagination />
    </DataTable.Root>
  );
}
