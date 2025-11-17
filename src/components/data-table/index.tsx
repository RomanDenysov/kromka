/** biome-ignore-all lint/suspicious/noExplicitAny: Need to ignore this */
"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  Fragment,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTablePagination } from "./ui/data-table-pagination";
import { DataTableSearch } from "./ui/data-table-search";

export interface UseDataTableProps<TData>
  extends Omit<TableOptions<TData>, "getCoreRowModel"> {
  // Делаем columns и data обязательными
  columns: ColumnDef<TData>[];
  data: TData[];
}

export function useDataTable<TData>({
  columns,
  data,
  ...options
}: UseDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
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

function _DataTableRoot<TData>({
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

function _DataTableFilter<TValue = any>({
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
      className={cn("flex items-center gap-2", props.className)}
      role="toolbar"
    />
  );
}

type DataTableContentProps<TData = any> = {
  emptyState?: ReactNode;
  className?: string;
  onRowClick?: (row: TData) => void;
  renderSubComponent?: (props: { row: any }) => ReactElement;
};

function _DataTableContent<TData = any>({
  emptyState,
  className,
  onRowClick,
  renderSubComponent,
}: DataTableContentProps<TData>) {
  const table = useDataTableContext<TData>();
  const columns = table.getAllColumns();

  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className={cn(
                    header.column.getCanSort() && "cursor-pointer select-none"
                  )}
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ width: header.getSize() }}
                >
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <span className="ml-2 cursor-pointer">
                        <ArrowUpDownIcon className="size-4" />
                      </span>
                    )}
                  </div>
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
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
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
                {row.getIsExpanded() && renderSubComponent && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      {renderSubComponent({ row })}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                {emptyState || "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function _DataTableInfo({ className }: { className?: string }) {
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
  Root: _DataTableRoot,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Filter: _DataTableFilter,
  Content: _DataTableContent,
  Pagination: DataTablePagination,
  Info: _DataTableInfo,
  useDataTable,
};
