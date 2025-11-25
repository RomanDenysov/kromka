"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DataTableSearch,
  fuzzyFilter,
} from "@/components/data-table/ui/data-table-search";
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
import { useCreateDraftCategory } from "@/hooks/use-create-draft-category";
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
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();
  const { data } = useSuspenseQuery(trpc.admin.categories.list.queryOptions());

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateDraftCategory();

  const { mutate: copyCategory } = useMutation(
    trpc.admin.categories.copyCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
  const toggleActive = useMutation(
    trpc.admin.categories.toggleActive.mutationOptions({
      onMutate: ({ id }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousCategories = queryClient.getQueryData(queryKey);
        if (previousCategories) {
          queryClient.setQueryData<TableCategory[]>(queryKey, (old) =>
            old?.map((category) =>
              category.id === id
                ? {
                    ...category,
                    isActive: !category.isActive,
                  }
                : category
            )
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );

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
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      toggleActive: (id: string) => {
        toggleActive.mutate({ id });
      },
      onCopy: (id: string) => {
        copyCategory({ categoryId: id });
      },
      onDelete: (id: string) => {
        // biome-ignore lint/suspicious/noConsole: Need to ignore this
        console.log("Delete category", id);
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
