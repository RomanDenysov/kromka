/** biome-ignore-all lint/style/noMagicNumbers: Ignore it for now */
import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [16, 25, 50, 100];

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageSizeOptions?: number[];
} & ComponentProps<"div">;

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = PAGE_SIZES,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  "use no memo";
  return (
    <div
      className={cn("flex items-center justify-between p-3", className)}
      {...props}
    >
      <div className="flex-1 text-muted-foreground text-sm">
        {table.getFilteredSelectedRowModel().rows.length} z{" "}
        {table.getFilteredRowModel().rows.length} riadkov vybraných.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm">Riadkov na stránke</p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger size="xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          Stránka {table.getState().pagination.pageIndex + 1} z{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hidden lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon-xs"
            variant="outline"
          >
            <span className="sr-only">Prejsť na prvú stránku</span>
            <ChevronsLeft />
          </Button>
          <Button
            className=""
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-xs"
            variant="outline"
          >
            <span className="sr-only">Prejsť na predchádzajúcu stránku</span>
            <ChevronLeft />
          </Button>
          <Button
            className=""
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-xs"
            variant="outline"
          >
            <span className="sr-only">Prejsť na ďalšiu stránku</span>
            <ChevronRight />
          </Button>
          <Button
            className="hidden lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon-xs"
            variant="outline"
          >
            <span className="sr-only">Prejsť na poslednú stránku</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
