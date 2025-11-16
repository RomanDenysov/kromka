"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { createDraftCategory } from "@/app/(admin)/admin/b2c/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const processedCategories = useMemo(
    () => categories.map((category: Category) => category),
    [categories]
  );

  const table = useReactTable({
    data: processedCategories,
    columns,
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <Input
          className="max-w-xs"
          onChange={(event) =>
            table?.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="Hľadať kategóriu..."
          value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
          volume="sm"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => createDraftCategory()}
            size="xs"
            variant="outline"
          >
            <PlusIcon />
            Pridať kategóriu
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
      </Table>
    </div>
  );
}
