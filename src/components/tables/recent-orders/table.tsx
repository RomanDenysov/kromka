"use client";

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useState } from "react";
import type { RecentOrdersData } from "@/app/(admin)/admin/_components/recent-orders";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/data-table-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatPrice } from "@/lib/utils";
import { columns } from "./columns";

export function RecentOrdersTable({ orders }: { orders: RecentOrdersData }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => row.original.items.length > 0,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    state: {
      globalFilter,
    },
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    paginateExpandedRows: false,
  });

  return (
    <>
      <div className="border-b p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať objednávku..."
          value={globalFilter ?? ""}
        />
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
                {row.getIsExpanded() &&
                  row.original.items.map((item) => (
                    <TableRow className="p-0" key={item.productId}>
                      <TableCell className="font-medium text-xs" colSpan={1} />
                      <TableCell className="font-medium text-xs" colSpan={1}>
                        {item.product.name}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        x{item.quantity}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {formatPrice(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                Žiadne objednávky.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
