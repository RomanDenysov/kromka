"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, StoreIcon } from "lucide-react";
import { Fragment, useMemo, useState, useTransition } from "react";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/data-table-search";
import { TableEmptyState } from "@/components/table-empty-state";
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
import {
  copyStoreAction,
  createDraftStoreAction,
  deleteStoresAction,
  toggleIsActiveStoresAction,
} from "@/lib/actions/stores";
import type { AdminStore } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { columns } from "./columns";

export function StoresTable({ stores }: { stores: AdminStore[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isPending, startTransition] = useTransition();

  const handleCreateDraft = () =>
    startTransition(async () => {
      await createDraftStoreAction();
    });

  const processedStores = useMemo(() => stores.map((store) => store), [stores]);

  const table = useReactTable<AdminStore>({
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
      toggleActive: async (id: string) => {
        await toggleIsActiveStoresAction({ ids: [id] });
      },
      onCopy: async (id: string) => {
        await copyStoreAction({ storeId: id });
      },
      onDelete: async (id: string) => {
        await deleteStoresAction({ ids: [id] });
      },
    },
  });

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať obchod..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          <Button disabled={isPending} onClick={handleCreateDraft} size="sm">
            {isPending ? (
              <>
                <Spinner />
                Pridávame...
              </>
            ) : (
              <>
                <PlusIcon />
                Pridať
              </>
            )}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="text-xs"
                  key={header.id}
                  style={{ width: header.getSize() }}
                >
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
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                <TableEmptyState icon={StoreIcon}>
                  <Button
                    disabled={isPending}
                    onClick={handleCreateDraft}
                    size="sm"
                    variant="outline"
                  >
                    {isPending ? (
                      <>
                        <Spinner />
                        Pridávame...
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        Pridať
                      </>
                    )}
                  </Button>
                </TableEmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getRowModel().rows?.length > 0 && (
          <TableFooter>
            <TableRow className="p-0">
              <TableCell className="p-0" colSpan={columns.length} />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
