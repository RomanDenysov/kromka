"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { flexRender, getFilteredRowModel } from "@tanstack/react-table";
import { ArrowDownIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSearch } from "@/components/data-table/ui/data-table-search";
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
import { useCreateDraftStore } from "@/hooks/use-create-draft-store";
import { useTRPC } from "@/trpc/client";
import type { Store } from "@/types/store";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export function StoresTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.stores.list.queryOptions());
  const { mutate: createDraftStore, isPending: isCreatingDraftStore } =
    useCreateDraftStore();

  const processedStores = useMemo(() => data ?? [], [data]);

  const table = DataTable.useDataTable<Store>({
    data: processedStores,
    columns,
    getRowId: ({ id }) => id,
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) =>
            table.getColumn("name")?.setFilterValue(String(value))
          }
          placeholder="Hľadať obchod..."
          value={table.getColumn("name")?.getFilterValue() as string}
        />
        <div>
          <Button size="xs" variant="outline">
            <ArrowDownIcon />
            Export
          </Button>
        </div>
      </div>
      <Table className="border-t">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-20 text-center" colSpan={columns.length}>
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getRowModel().rows?.length && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Button
                  disabled={isCreatingDraftStore}
                  onClick={() => createDraftStore()}
                  size="sm"
                  variant="ghost"
                >
                  {isCreatingDraftStore ? (
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
