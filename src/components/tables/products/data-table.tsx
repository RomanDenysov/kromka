"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TablePagination } from "@/components/data-table/ui/table-pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductParams } from "@/hooks/use-product-params";
import type { Product } from "@/types/products";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";
import { ProductsToolbar } from "./products-toolbar";

export function DataTable({ products }: { products: Product[] }) {
  const { setParams } = useProductParams();
  const table = useReactTable<Product>({
    data: products,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onEdit: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        setParams({ productId: id });
      },
      onDelete: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log("Delete product", id);
      },
    },
  });

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <Input
          className="max-w-xs"
          onChange={(event) =>
            table?.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="Hľadať produkt..."
          value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
          volume="sm"
        />
        <ProductsToolbar />
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
        <TableFooter className="p-0">
          <TableRow className="p-0">
            <TableCell className="p-0 text-center" colSpan={columns.length} />
          </TableRow>
        </TableFooter>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
