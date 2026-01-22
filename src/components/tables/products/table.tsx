/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers for pagination and table sizing */
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
import { useCallback, useMemo, useState, useTransition } from "react";
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
  copyProductAction,
  createDraftProductAction,
  deleteProductsAction,
  toggleIsActiveProductAction,
} from "@/features/products/api/actions";
import type { AdminProduct } from "@/features/products/api/queries";
import { useProductParams } from "@/hooks/use-product-params";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/widgets/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const { setParams } = useProductParams();

  const processedProducts = useMemo(() => products ?? [], [products]);

  const table = useReactTable<AdminProduct>({
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const product = row.original;
      return (
        product.name?.toLowerCase().includes(searchValue) ||
        product.category?.name?.toLowerCase().includes(searchValue) ||
        product.status?.toLowerCase().includes(searchValue)
      );
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      sorting,
      rowSelection,
      pagination,
      globalFilter,
    },
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiSort: true,
    meta: {
      onOpen: (id: string) => {
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

  const statusOptions = [
    { label: "Návrh", value: "draft" },
    { label: "Aktívny", value: "active" },
    { label: "Predaný", value: "sold" },
    { label: "Archivovaný", value: "archived" },
  ];

  const isActiveOptions = [
    { label: "Aktívny", value: "true" },
    { label: "Neaktívny", value: "false" },
  ];

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať produkty, kategórie, status..."
            value={globalFilter}
          />
          <DataTableMultiSelectFilter
            columnId="status"
            options={statusOptions}
            table={table}
            title="Status"
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
