"use client";

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentOrder, RecentOrdersData } from "@/lib/queries/dashboard";
import { cn, formatPrice } from "@/lib/utils";
import { columns } from "./columns";

const PAGE_SIZE = 10;

export function RecentOrdersTable({ orders }: { orders: RecentOrdersData }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const paginatedData = orders.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE
  );

  const table = useReactTable<RecentOrder>({
    data: paginatedData,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => row.original.items.length > 0,
    state: {
      sorting,
    },
    getExpandedRowModel: getExpandedRowModel(),
    paginateExpandedRows: false,
    manualPagination: true,
    pageCount: Math.ceil(orders.length / PAGE_SIZE),
  });

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const hasNextPage = pageIndex < totalPages - 1;
  const hasPreviousPage = pageIndex > 0;

  return (
    <div className="space-y-4">
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Zobrazených {paginatedData.length} z {orders.length} objednávok
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="rounded border p-2 text-sm disabled:opacity-50"
              disabled={!hasPreviousPage}
              onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
              type="button"
            >
              Predchádzajúca
            </button>
            <span className="text-sm">
              Strana {pageIndex + 1} z {totalPages}
            </span>
            <button
              className="rounded border p-2 text-sm disabled:opacity-50"
              disabled={!hasNextPage}
              onClick={() =>
                setPageIndex((old) => Math.min(old + 1, totalPages - 1))
              }
              type="button"
            >
              Ďalšia
            </button>
          </div>
        </div>
      )}

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
                        {formatPrice(item.price * item.quantity)}
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
    </div>
  );
}
