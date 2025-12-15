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
import { ArrowDownIcon, FileIcon, TablePropertiesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/data-table-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerParams } from "@/hooks/use-customer-params";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import type { UserList } from "@/lib/queries/users";
import { cn } from "@/lib/utils";
import { columns } from "./columns";

const userExportColumns: ExportColumnConfig<UserList[number]>[] = [
  {
    key: "email",
    header: "Email",
  },
  {
    key: "name",
    header: "Meno",
  },
  {
    key: "role",
    header: "Rola",
  },
  {
    key: "phone",
    header: "Telefón",
  },
  {
    key: "emailVerified",
    header: "Email overený",
    format: (value) => (value ? "Áno" : "Nie"),
  },
  {
    key: "createdAt",
    header: "Registrovaný",
    format: (value) =>
      value instanceof Date ? value.toLocaleDateString("sk-SK") : "",
  },
];

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
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable<UserList[number]>({
    data: processedUsers,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    meta: {
      onOpen: (id: string) => {
        setParams({ customerId: id });
      },
      onLock: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: Ignore it for now
        console.log(id);
      },
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleExport = async (format: "csv" | "xlsx") => {
    const exportData = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!exportData.length) {
      return;
    }

    if (format === "csv") {
      exportAsCsv(exportData, userExportColumns, "users");
    } else {
      await exportAsXlsx(exportData, userExportColumns, "users");
    }
  };

  return (
    <div className={cn("size-full", className)}>
      <div className="flex items-center justify-between border-t p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať používateľa..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowDownIcon />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileIcon />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                <TablePropertiesIcon />
                XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
