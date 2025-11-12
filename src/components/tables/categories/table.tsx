"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import { columns } from "./columns";

export function CategoriesTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.categories.list.queryOptions());

  const processedCategories = useMemo(() => data ?? [], [data]);

  const table = useReactTable({
    data: processedCategories,
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
            {/* <Button
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
            </Button> */}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
