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
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/ui/data-table-search";
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
import { useCreateDraftCategory } from "@/hooks/use-create-draft-category";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export type TableCategory =
  RouterOutputs["admin"]["categories"]["list"][number];

export function CategoriesTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();
  const { data } = useSuspenseQuery(trpc.admin.categories.list.queryOptions());

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateDraftCategory();

  const { mutate: copyCategory } = useMutation(
    trpc.admin.categories.copyCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
  const toggleActive = useMutation(
    trpc.admin.categories.toggleActive.mutationOptions({
      onMutate: ({ id }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousCategories = queryClient.getQueryData(queryKey);
        if (previousCategories) {
          queryClient.setQueryData<TableCategory[]>(queryKey, (old) =>
            old?.map((category) =>
              category.id === id
                ? {
                    ...category,
                    isActive: !category.isActive,
                  }
                : category
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

  const processedCategories = useMemo(
    () => data.map((category) => category),
    [data]
  );

  const table = useReactTable({
    data: processedCategories,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      globalFilter,
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      toggleActive: (id: string) => {
        toggleActive.mutate({ id });
      },
      onCopy: (id: string) => {
        copyCategory({ categoryId: id });
      },
      onDelete: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: Need to ignore this
        console.log("Delete category", id);
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
          placeholder="Hľadať kategóriu..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          <Button size="xs" variant="outline">
            <PlusIcon />
            Pridať kategóriu
          </Button>
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
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      {row.original.description}
                    </TableCell>
                  </TableRow>
                )}
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
                    Pridávame kategóriu...
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Pridať kategóriu
                  </>
                )}
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
