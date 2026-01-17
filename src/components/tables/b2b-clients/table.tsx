/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers for pagination and table sizing */
"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { Organization } from "@/features/b2b/clients/queries";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";

export function B2BClientsTable({
  organizations,
}: {
  organizations: Organization[];
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  const processedOrgs = useMemo(() => organizations ?? [], [organizations]);

  const table = useReactTable<Organization>({
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const org = row.original;
      return Boolean(
        org.name?.toLowerCase().includes(searchValue) ||
          org.billingName?.toLowerCase().includes(searchValue) ||
          org.billingEmail?.toLowerCase().includes(searchValue) ||
          org.ico?.toLowerCase().includes(searchValue) ||
          org.priceTier?.name?.toLowerCase().includes(searchValue)
      );
    },
    getSortedRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      sorting,
      pagination,
      globalFilter,
    },
    data: processedOrgs,
    getRowId: ({ id }) => id,
    columns,
    enableGlobalFilter: true,
    enableMultiSort: true,
    meta: {
      onOpen: (id: string) => {
        window.location.href = `/admin/b2b/clients/${id}`;
      },
    },
  });

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať organizácie, IČO, email..."
            value={globalFilter}
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </DataTable>
  );
}
