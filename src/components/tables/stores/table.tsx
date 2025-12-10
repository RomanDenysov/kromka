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
import {
  ArrowDownIcon,
  FileIcon,
  PlusIcon,
  TablePropertiesIcon,
} from "lucide-react";
import { Fragment, useMemo, useState, useTransition } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  copyStoreAction,
  createDraftStoreAction,
  deleteStoresAction,
  toggleIsActiveStoresAction,
} from "@/lib/actions/stores";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import type { AdminStore } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

const storeExportColumns: ExportColumnConfig<AdminStore>[] = [
  {
    key: "name",
    header: "Názov",
  },
  {
    key: "slug",
    header: "Slug",
  },
  {
    key: "city",
    header: "Mesto",
  },
  {
    key: "isActive",
    header: "Aktívny",
    format: (value) => (value ? "Áno" : "Nie"),
  },
  {
    key: "createdAt",
    header: "Vytvorené",
    format: (value) =>
      value instanceof Date ? value.toLocaleDateString("sk-SK") : "",
  },
  {
    key: "updatedAt",
    header: "Upravené",
    format: (value) =>
      value instanceof Date ? value.toLocaleDateString("sk-SK") : "",
  },
];

export function StoresTable({ stores }: { stores: AdminStore[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isPending, startTransition] = useTransition();

  const handleCreateDraft = () =>
    startTransition(async () => {
      await createDraftStoreAction();
    });

  const processedStores = useMemo(() => stores.map((store) => store), [stores]);

  const table = useReactTable<AdminStore>({
    data: processedStores,
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

  const handleExport = async (format: "csv" | "xlsx") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const exportData = selectedRows.length
      ? selectedRows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original);

    if (!exportData.length) {
      return;
    }

    if (format === "csv") {
      exportAsCsv(exportData, storeExportColumns, "stores");
    } else {
      await exportAsXlsx(exportData, storeExportColumns, "stores");
    }
  };

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať obchod..."
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
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getRowModel().rows?.length > 0 && (
          <TableFooter>
            <TableRow className="p-0">
              <TableCell className="p-0" colSpan={columns.length}>
                <Button
                  className="w-full rounded-none"
                  disabled={isPending}
                  onClick={handleCreateDraft}
                  size="sm"
                  variant="ghost"
                >
                  {isPending ? (
                    <>
                      <Spinner />
                      Pridávame obchod...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Pridať obchod
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
