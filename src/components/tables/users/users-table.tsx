"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerParams } from "@/hooks/use-customer-params";
import type { UserList } from "@/features/user-management/api/queries";
import { cn } from "@/lib/utils";
import { DataTableMultiSelectFilter } from "@/widgets/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { columns } from "./columns";

export function UsersTable({
  users,
  className,
}: {
  users: UserList;
  className?: string;
}) {
  const { setParams } = useCustomerParams();

  const processedUsers = useMemo(() => users, [users]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable<UserList[number]>({
    data: processedUsers,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }
      const searchValue = filterValue.toLowerCase();
      const user = row.original;
      const matchesName =
        user.name?.toLowerCase().includes(searchValue) ?? false;
      const matchesEmail =
        user.email?.toLowerCase().includes(searchValue) ?? false;
      const matchesPhone =
        user.phone?.toLowerCase().includes(searchValue) ?? false;
      return matchesName || matchesEmail || matchesPhone;
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
    meta: {
      onOpen: (id: string) => {
        setParams({ customerId: id });
      },
      onLock: (id: string) => {
        console.log(id);
      },
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Manažér", value: "manager" },
    { label: "Užívateľ", value: "user" },
  ];

  return (
    <div className={cn("size-full", className)}>
      <div className="flex items-center justify-between border-t p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať používateľov..."
            value={globalFilter}
          />
          <DataTableMultiSelectFilter
            columnId="role"
            options={roleOptions}
            table={table}
            title="Pozícia"
          />
        </div>
      </div>
      <div className="size-full overflow-hidden border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-xs" key={header.id}>
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
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-20 text-center"
                  colSpan={columns.length}
                >
                  Žiadne výsledky.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
