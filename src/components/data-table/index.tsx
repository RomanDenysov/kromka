/** biome-ignore-all lint/suspicious/noExplicitAny: Need to ignore this */
"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table";
import {
  type ComponentProps,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./ui/data-table-pagination";
import { DataTableSearch, fuzzyFilter } from "./ui/data-table-search";

export interface UseDataTableProps<TData>
  extends Omit<TableOptions<TData>, "getCoreRowModel" | "filterFns"> {
  // Делаем columns и data обязательными
  columns: ColumnDef<TData>[];
  data: TData[];
  // filterFns опциональный, по умолчанию добавляем fuzzy
  filterFns?: TableOptions<TData>["filterFns"];
}

export function useDataTable<TData>({
  columns,
  data,
  filterFns,
  ...options
}: UseDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
      ...filterFns,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...options,
  });

  return table;
}

const DataTableContext = createContext<TanstackTable<any> | null>(null);

export function useDataTableContext<TData = any>() {
  const context = useContext(DataTableContext) as TanstackTable<TData> | null;
  if (!context) {
    throw new Error("DataTable components must be used within DataTable.Root");
  }
  return context;
}

type DataTableRootProps<TData> = {
  table: TanstackTable<TData>;
  children: React.ReactNode;
  className?: string;
};

function DataTableRoot<TData>({
  table,
  children,
  className,
}: DataTableRootProps<TData>) {
  return (
    <DataTableContext.Provider value={table}>
      <div className={cn("flex h-full flex-col", className)}>{children}</div>
    </DataTableContext.Provider>
  );
}

type DataTableFilterProps<TValue = any> = {
  columnId: string;
  children: (props: {
    value: TValue;
    onChange: (value: TValue) => void;
    column: any;
  }) => React.ReactNode;
};

function DataTableFilter<TValue = any>({
  columnId,
  children,
}: DataTableFilterProps<TValue>) {
  const table = useDataTableContext();
  const column = table.getColumn(columnId);

  if (!column) {
    // biome-ignore lint/suspicious/noConsole: Need to ignore this
    console.warn(`Column "${columnId}" not found`);
    return null;
  }

  return (
    <>
      {children({
        value: column.getFilterValue() as TValue,
        onChange: (value: TValue) => column.setFilterValue(value),
        column,
      })}
    </>
  );
}

export function DataTableToolbar(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("flex items-center gap-2 p-3", props.className)}
      data-slot="toolbar"
      role="toolbar"
    />
  );
}

function DataTableActions({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex grow items-center justify-end gap-2", className)}
      data-slot="actions"
      {...props}
    >
      {children}
    </div>
  );
}

type DataTableContentProps<TData = any> = {
  emptyState?: ReactNode;
  className?: string;
  onRowClick?: (row: TData) => void;
  renderSubComponent?: (props: { row: any }) => ReactElement;
};

function DataTableContent<TData = any>({
  className,
}: DataTableContentProps<TData>) {
  useDataTableContext<TData>();

  return <div className={cn("flex-1 overflow-auto", className)} />;
}

function DataTableInfo({ className }: { className?: string }) {
  const table = useDataTableContext();
  const filtered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className={cn("px-4 py-2 text-muted-foreground text-xs", className)}>
      Showing {table.getFilteredRowModel().rows.length} of{" "}
      {table.getPreFilteredRowModel().rows.length} results
      {filtered && " (filtered)"}
    </div>
  );
}

export const DataTable = {
  Root: DataTableRoot,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Filter: DataTableFilter,
  Content: DataTableContent,
  Pagination: DataTablePagination,
  Info: DataTableInfo,
  Actions: DataTableActions,
  useDataTable,
};
