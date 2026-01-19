/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers for pagination and table sizing */
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
import { useMemo, useState } from "react";
import type { B2bApplication } from "@/features/b2b/applications/api/queries";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/widgets/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";

export function B2BApplicationsTable({
  applications,
}: {
  applications: B2bApplication[];
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  const processedApplications = useMemo(
    () => applications ?? [],
    [applications]
  );

  const table = useReactTable<B2bApplication>({
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const app = row.original;
      return (
        app.companyName?.toLowerCase().includes(searchValue) ||
        app.contactName?.toLowerCase().includes(searchValue) ||
        app.contactEmail?.toLowerCase().includes(searchValue) ||
        app.ico?.toLowerCase().includes(searchValue) ||
        app.status?.toLowerCase().includes(searchValue)
      );
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      sorting,
      pagination,
      globalFilter,
    },
    data: processedApplications,
    getRowId: ({ id }) => id,
    columns,
    enableGlobalFilter: true,
    enableMultiSort: true,
    meta: {
      onOpen: (id: string) => {
        window.location.href = `/admin/b2b/applications/${id}`;
      },
    },
  });

  const statusOptions = [
    { label: "Čaká", value: "pending" },
    { label: "Schválená", value: "approved" },
    { label: "Zamietnutá", value: "rejected" },
  ];

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať spoločnosti, kontakty, IČO..."
            value={globalFilter}
          />
          <DataTableMultiSelectFilter
            columnId="status"
            options={statusOptions}
            table={table}
            title="Status"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </DataTable>
  );
}
