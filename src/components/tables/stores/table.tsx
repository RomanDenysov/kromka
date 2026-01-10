"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  copyStoreAction,
  createDraftStoreAction,
  deleteStoresAction,
  toggleIsActiveStoresAction,
} from "@/features/stores/actions";
import type { AdminStore } from "@/features/stores/queries";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/widgets/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";

export function StoresTable({ stores }: { stores: AdminStore[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });

  const [isPending, startTransition] = useTransition();

  const handleCreateDraft = () =>
    startTransition(async () => {
      await createDraftStoreAction();
    });

  const processedStores = useMemo(() => stores.map((store) => store), [stores]);

  const table = useReactTable<AdminStore>({
    data: processedStores,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const store = row.original;
      return store.name?.toLowerCase().includes(searchValue);
    },
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      sorting,
      globalFilter,
      pagination,
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      toggleActive: async (id: string) => {
        await toggleIsActiveStoresAction({ ids: [id] });
      },
      onCopy: async (id: string) => {
        await copyStoreAction({ storeId: id });
      },
      onDelete: async (id: string) => {
        await deleteStoresAction({ ids: [id] });
      },
    },
  });

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
            placeholder="Hľadať predajne..."
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
          <Button disabled={isPending} onClick={handleCreateDraft} size="sm">
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
