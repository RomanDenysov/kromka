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
import { FolderOpenIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState, useTransition } from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  copyCategoryAction,
  createDraftCategoryAction,
  deleteCategoriesAction,
  toggleIsActiveCategoryAction,
  toggleIsFeaturedCategoryAction,
} from "@/lib/actions/categories";
import type { AdminCategory } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";
import { columns } from "./columns";

export function CategoriesTable({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });

  const [isPending, startTransition] = useTransition();

  const table = useReactTable<AdminCategory>({
    data: categories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    meta: {
      toggleActive: async (id: string) => {
        await toggleIsActiveCategoryAction({ id });
      },
      onCopy: async (id: string) => {
        await copyCategoryAction({ id });
      },
      onDelete: async (id: string) => {
        await deleteCategoriesAction({ ids: [id] });
      },
      toggleFeatured: async (id: string) => {
        await toggleIsFeaturedCategoryAction({ id });
      },
    },
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-full max-w-sm flex-1"
            onChange={(event) =>
              table
                .getColumn("name")
                ?.setFilterValue(event.target.value.toLowerCase().trim())
            }
            placeholder="Filter categories..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          {Object.keys(rowSelection).length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={Object.keys(rowSelection).length === 0}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2Icon />
                  Vymazať {Object.keys(rowSelection).length} kategórií
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť kategórie</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť {Object.keys(rowSelection).length}{" "}
                    kategórií? Táto akcia je nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteCategoriesAction({ ids: Object.keys(rowSelection) })
                    }
                    size="sm"
                    variant="destructive"
                  >
                    Odstrániť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await createDraftCategoryAction();
              })
            }
            size="sm"
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
      <div className="flex-1 overflow-hidden">
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
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        {row.original.description}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  <TableEmptyState icon={FolderOpenIcon}>
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await createDraftCategoryAction();
                        })
                      }
                      size="sm"
                      variant="outline"
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
                  </TableEmptyState>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
