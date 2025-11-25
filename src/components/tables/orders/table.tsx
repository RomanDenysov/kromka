/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, FileIcon, TablePropertiesIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/ui/data-table-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";

export type TableOrder = RouterOutputs["admin"]["orders"]["list"][number];

const orderExportColumns: ExportColumnConfig<TableOrder>[] = [
  {
    key: "orderNumber",
    header: "Objednávka",
  },
  {
    key: "orderStatus",
    header: "Stav",
  },
  {
    key: "createdBy.email",
    header: "Email zákazníka",
  },
  {
    key: "store.name",
    header: "Predajňa",
  },
  {
    key: "totalCents",
    header: "Spolu (EUR)",
    format: (value) =>
      // biome-ignore lint/style/noMagicNumbers: <explanation>
      typeof value === "number" ? (value / 100).toFixed(2) : "",
  },
  {
    key: "createdAt",
    header: "Vytvorené",
    format: (value) =>
      value instanceof Date ? value.toLocaleString("sk-SK") : "",
  },
];

export function OrdersTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.orders.list.queryOptions());

  const processedOrders = useMemo(() => data ?? [], [data]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable<TableOrder>({
    data: processedOrders,
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
    enableRowSelection: true,
  });

  const handleExport = async (format: "csv" | "xlsx") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const exportData = selectedRows.length
      ? selectedRows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original);

    if (!exportData.length) {
      return;
    }

    if (format === "csv") {
      exportAsCsv(exportData, orderExportColumns, "orders");
    } else {
      await exportAsXlsx(exportData, orderExportColumns, "orders");
    }
  };

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať objednávku..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowDownIcon />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileIcon />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                <TablePropertiesIcon />
                XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                Žiadne objednávky.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
