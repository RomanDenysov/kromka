"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, FileIcon, PlusIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/ui/data-table-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useCreateDraftStore } from "@/hooks/use-create-draft-store";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export type TableStore = RouterOutputs["admin"]["stores"]["list"][number];

export function StoresTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.stores.list.queryKey();
  const { data } = useSuspenseQuery(trpc.admin.stores.list.queryOptions());

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateDraftStore();

  const { mutate: copyStore } = useMutation(
    trpc.admin.stores.copyStore.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );

  const toggleActive = useMutation(
    trpc.admin.stores.toggleIsActive.mutationOptions({
      onMutate: ({ id }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousStores = queryClient.getQueryData(queryKey);
        if (previousStores) {
          queryClient.setQueryData<TableStore[]>(queryKey, (old) =>
            old?.map((store) =>
              store.id === id
                ? {
                    ...store,
                    isActive: !store.isActive,
                  }
                : store
            )
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );

  const processedStores = useMemo(() => data.map((store) => store), [data]);

  const table = useReactTable({
    data: processedStores,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      toggleActive: (id: string) => {
        toggleActive.mutate({ id });
      },
      onCopy: (id: string) => {
        copyStore({ storeId: id });
      },
      onDelete: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: Need to ignore this
        console.log("Delete store", id);
      },
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to ignore this
  useEffect(() => {
    if (
      table.getState().columnFilters[0]?.id === "name" &&
      table.getState().sorting[0]?.id !== "name"
    ) {
      table.setSorting([{ id: "name", desc: false }]);
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať obchod..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowDownIcon />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileIcon />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  className={cn("transition-colors hover:bg-muted/50")}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Stores don't have description in list usually, or maybe they do? 
                    Category table shows description on expansion.
                    Let's keep it only if 'description' is a key field, but let's check type.
                    Store type has description as JSONContent. Rendering it might be complex.
                    Category description is likely text.
                    I'll omit the expansion row for now to avoid issues unless requested or description is simple text.
                    Wait, categories table row expansion renders row.original.description.
                    Let's check category schema. Description is text.
                    Store description is JSONContent.
                    I will REMOVE the expansion row for stores for now.
                */}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getRowModel().rows?.length > 0 && (
          <TableFooter>
            <TableRow className="p-0">
              <TableCell className="p-0" colSpan={columns.length}>
                <Button
                  className="w-full rounded-none"
                  disabled={isCreatingDraft}
                  onClick={() => createDraft()}
                  size="sm"
                  variant="ghost"
                >
                  {isCreatingDraft ? (
                    <>
                      <Spinner />
                      Pridávame obchod...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Pridať obchod
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
