"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  FileIcon,
  PlusIcon,
  TablePropertiesIcon,
  Trash2Icon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/data-table-search";
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
  useCopyCategory,
  useCreateDraftCategory,
  useDeleteCategories,
  useToggleCategories,
  useToggleFeaturedCategory,
} from "@/hooks/use-admin-categories-mutations";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export type TableCategory =
  RouterOutputs["admin"]["categories"]["list"][number];

const categoryExportColumns: ExportColumnConfig<TableCategory>[] = [
  {
    key: "name",
    header: "Názov",
  },
  {
    key: "isActive",
    header: "Aktívna",
    format: (value) => (value ? "Áno" : "Nie"),
  },
  {
    key: "showInMenu",
    header: "Viditeľná v menu",
    format: (value) => (value ? "Áno" : "Nie"),
  },
  {
    key: "productsCount",
    header: "Počet produktov",
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

export function CategoriesTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.categories.list.queryOptions());

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateDraftCategory();

  const { mutate: copyCategory } = useCopyCategory();
  const { mutate: toggleActive } = useToggleCategories();
  const { mutate: deleteCategories, isPending: isDeletingCategories } =
    useDeleteCategories();
  const { mutate: toggleFeatured } = useToggleFeaturedCategory();

  const processedCategories = useMemo(
    () => data.map((category) => category),
    [data]
  );

  const table = useReactTable({
    data: processedCategories,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      toggleActive: (id: string) => {
        toggleActive({ ids: [id] });
      },
      onCopy: (id: string) => {
        copyCategory({ categoryId: id });
      },
      onDelete: (id: string) => {
        deleteCategories({ ids: [id] });
      },
      toggleFeatured: (id: string) => {
        toggleFeatured({ categoryId: id });
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
      exportAsCsv(exportData, categoryExportColumns, "categories");
    } else {
      await exportAsXlsx(exportData, categoryExportColumns, "categories");
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to ignore this
  useEffect(() => {
    if (
      table.getState().columnFilters[0]?.id === "name" &&
      table.getState().sorting[0]?.id !== "name"
    ) {
      table.setSorting([{ id: "name", desc: false }]);
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať kategóriu..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          {Object.keys(rowSelection).length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    isDeletingCategories ||
                    Object.keys(rowSelection).length === 0
                  }
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
                      deleteCategories({ ids: Object.keys(rowSelection) })
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
                  disabled={isCreatingDraft}
                  onClick={() => createDraft()}
                  size="sm"
                  variant="ghost"
                >
                  {isCreatingDraft ? (
                    <>
                      <Spinner />
                      Pridávame kategóriu...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Pridať kategóriu
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
