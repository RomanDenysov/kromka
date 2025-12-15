/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  PackageOpenIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Fragment, useCallback, useMemo, useState, useTransition } from "react";
import { TableEmptyState } from "@/components/table-empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductParams } from "@/hooks/use-product-params";
import {
  copyProductAction,
  createDraftProductAction,
  deleteProductsAction,
  toggleIsActiveProductAction,
} from "@/lib/actions/products";
import type { AdminProduct } from "@/lib/queries/products";
import { cn } from "@/lib/utils";
import { columns } from "./columns";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [isPending, startTransition] = useTransition();

  const { setParams } = useProductParams();

  const processedProducts = useMemo(() => products ?? [], [products]);

  const table = useReactTable<AdminProduct>({
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
      sorting,
      rowSelection,
      pagination,
    },
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
    meta: {
      onEdit: (id: string) => {
        setParams({ productId: id });
      },
      onToggleActive: async (id: string) => {
        await toggleIsActiveProductAction({ id });
      },
      onCopy: async (id: string) => {
        await copyProductAction({ productId: id });
      },
      onDelete: async (id: string) => {
        await deleteProductsAction({ ids: [id] });
      },
    },
  });

  const handleBulkDelete = useCallback(async () => {
    await deleteProductsAction({ ids: Object.keys(rowSelection) });
  }, [rowSelection]);

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center justify-end gap-2">
          {Object.keys(rowSelection).length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={Object.keys(rowSelection).length === 0}
                  size="xs"
                  variant="destructive"
                >
                  <Trash2Icon />
                  Vymazať {Object.keys(rowSelection).length} produktov
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť produkty</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť {Object.keys(rowSelection).length}{" "}
                    produktov? Táto akcia je nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="xs">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    size="xs"
                    variant="destructive"
                  >
                    Vymazať
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await createDraftProductAction();
              })
            }
            size="xs"
          >
            {isPending ? (
              <>
                <Spinner />
                Pridávame...
              </>
            ) : (
              <>
                <PlusIcon />
                Pridať
              </>
            )}
          </Button>
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
                <TableEmptyState icon={PackageOpenIcon}>
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await createDraftProductAction();
                      })
                    }
                    size="xs"
                    variant="outline"
                  >
                    {isPending ? (
                      <>
                        <Spinner />
                        Pridávame produkt...
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        Pridať
                      </>
                    )}
                  </Button>
                </TableEmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between p-2">
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
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[16, 25, 50, 100].map((pageSize) => (
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
              <ChevronsLeftIcon />
            </Button>
            <Button
              className=""
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon-xs"
              variant="outline"
            >
              <span className="sr-only">Prejsť na predchádzajúcu stránku</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              className=""
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="icon-xs"
              variant="outline"
            >
              <span className="sr-only">Prejsť na ďalšiu stránku</span>
              <ChevronRightIcon />
            </Button>
            <Button
              className="hidden lg:flex"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              size="icon-xs"
              variant="outline"
            >
              <span className="sr-only">Prejsť na poslednú stránku</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
