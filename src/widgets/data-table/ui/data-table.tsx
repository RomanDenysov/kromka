"use client";

import {
  type ColumnDef,
  flexRender,
  type Table as ReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props<TData, TValue> = {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  footer?: ReactNode;
  className?: string;
};

export function DataTable<TData, TValue>({
  table,
  columns,
  footer,
  className,
}: Props<TData, TValue>) {
  return (
    <div className={cn("h-full overflow-hidden", className)}>
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
                Žiadne výsledky.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer && <TableFooterContent columns={columns} footer={footer} />}
      </Table>
    </div>
  );
}

function TableFooterContent<TData, TValue>({
  columns,
  footer,
}: {
  columns: ColumnDef<TData, TValue>[];
  footer: ReactNode;
}) {
  return (
    <TableFooter className="p-0">
      <TableRow className="p-0">
        <TableCell className="p-0 text-center" colSpan={columns.length}>
          {footer}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
