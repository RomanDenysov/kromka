import type { Table as ReactTable } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TablePagination<TData>({
  table,
  className,
}: {
  className?: string;
  table: ReactTable<TData>;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-muted-foreground text-xs">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div
          className={cn(
            "flex items-center justify-end space-x-1 py-2",
            className
          )}
        >
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.firstPage()}
            size="icon-xs"
            variant="outline"
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-xs"
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-xs"
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.lastPage()}
            size="icon-xs"
            variant="outline"
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
