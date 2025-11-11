"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStoreParams } from "@/hooks/use-store-params";
import { useTRPC } from "@/trpc/client";
import { columns } from "./columns";

export function StoresTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.admin.stores.list.queryOptions());

  const { mutate: createDraftStore, isPending } = useMutation(
    trpc.admin.stores.createDraft.mutationOptions({
      onSuccess: async (newStore) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.stores.list.queryKey(),
        });
        setStoreParams({ storeId: newStore.id });
      },
      onError: (_error) => {
        toast.error("Nepodarilo sa vytvoriť nový obchod");
      },
    })
  );
  const { setParams: setStoreParams } = useStoreParams();

  const processedStores = useMemo(() => data ?? [], [data]);

  const table = useReactTable({
    data: processedStores,
    columns,
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className="p-0">
        <TableRow className="p-0">
          <TableCell className="p-0" colSpan={table.getAllColumns().length}>
            <Button
              className="w-full"
              disabled={isPending}
              onClick={() => createDraftStore()}
              size="sm"
              variant="ghost"
            >
              {isPending ? (
                <>
                  <Spinner /> Pridávam obchod...
                </>
              ) : (
                <>
                  <PlusIcon className="size-4" />
                  Pridať obchod
                </>
              )}
            </Button>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
