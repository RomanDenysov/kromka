"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/components/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
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
import { Spinner } from "@/components/ui/spinner";
import {
  copyCategoryAction,
  createDraftCategoryAction,
  deleteCategoriesAction,
  toggleIsActiveCategoryAction,
  toggleIsFeaturedCategoryAction,
} from "@/lib/actions/categories";
import type { AdminCategory } from "@/lib/queries/categories";
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
  const [globalFilter, setGlobalFilter] = useState("");

  const [isPending, startTransition] = useTransition();

  const table = useReactTable<AdminCategory>({
    data: categories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const category = row.original;
      return (
        category.name?.toLowerCase().includes(searchValue) ||
        category.description?.toLowerCase().includes(searchValue)
      );
    },
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
      globalFilter,
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

  const isActiveOptions = [
    { label: "Aktívna", value: "true" },
    { label: "Neaktívna", value: "false" },
  ];

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať kategórie..."
            value={globalFilter}
          />
          <DataTableMultiSelectFilter
            columnId="isActive"
            options={isActiveOptions}
            table={table}
            title="Stav"
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
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </DataTable>
  );
}
