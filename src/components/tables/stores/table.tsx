"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { flexRender, getFilteredRowModel } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import type { Store } from "@/types/store";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";
import { Header } from "./header";

export function StoresTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.stores.list.queryOptions());

  const processedStores = useMemo(() => data ?? [], [data]);

  const table = DataTable.useDataTable<Store>({
    data: processedStores,
    columns,
    getRowId: ({ id }) => id,
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <div className="size-full overflow-hidden">
      <Header table={table} />
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
      </Table>
    </div>
  );
}
