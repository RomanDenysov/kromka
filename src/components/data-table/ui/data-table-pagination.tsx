import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataTableContext } from "..";

export function DataTablePagination({
  className,
  showSelectedRows = true,
  showPageCount = true,
}: {
  className?: string;
  showSelectedRows?: boolean;
  showPageCount?: boolean;
}) {
  const table = useDataTableContext();

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t px-2 py-1",
        className
      )}
    >
      {showSelectedRows && (
        <div className="flex-1 text-muted-foreground text-xs">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="flex items-center gap-x-3">
        {showPageCount && (
          <div className="flex w-[100px] items-center justify-center font-medium text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
        )}
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
