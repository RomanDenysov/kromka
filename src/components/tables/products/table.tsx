"use client";

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
  FileTextIcon,
  PlusIcon,
  TablePropertiesIcon,
  Trash2Icon,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
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
  useCopyProduct,
  useCreateDraftProduct,
  useDeleteProduct,
  useToggleProducts,
} from "@/hooks/use-admin-products-mutations";
import { useProductParams } from "@/hooks/use-product-params";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { columns } from "./columns";
import { EmptyState } from "./empty-state";

export type TableProduct = RouterOutputs["admin"]["products"]["list"][number];

const productExportColumns: ExportColumnConfig<TableProduct>[] = [
  {
    key: "name",
    header: "Názov",
  },
  {
    key: "sku",
    header: "SKU",
  },
  {
    key: "priceCents",
    header: "Cena (EUR)",
    format: (value) =>
      // biome-ignore lint/style/noMagicNumbers: Ignore it for now
      typeof value === "number" ? (value / 100).toFixed(2) : "",
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

export function ProductsTable({ products }: { products: TableProduct[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const { mutate: toggleActive } = useToggleProducts();

  const { mutate: copyProduct } = useCopyProduct();
  const { mutate: deleteProduct, isPending: isDeletingProducts } =
    useDeleteProduct();
  const { setParams } = useProductParams();

  const processedProducts = useMemo(() => products ?? [], [products]);

  const table = useReactTable<TableProduct>({
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "fuzzy",
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
    },
    data: processedProducts,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
    meta: {
      onEdit: (id: string) => {
        setParams({ productId: id });
      },
      onToggleActive: (id: string) => {
        toggleActive({ id });
      },
      onCopy: (id: string) => {
        copyProduct({ productId: id });
      },
      onDelete: (id: string) => {
        deleteProduct({ ids: [id] });
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
      exportAsCsv(exportData, productExportColumns, "products");
    } else {
      await exportAsXlsx(exportData, productExportColumns, "products");
    }
  };

  return (
    <div className="size-full overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <DataTableSearch
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Hľadať produkt..."
          value={globalFilter ?? ""}
        />
        <div className="flex items-center justify-end gap-2">
          {Object.keys(rowSelection).length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    isDeletingProducts || Object.keys(rowSelection).length === 0
                  }
                  size="sm"
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
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteProduct({ ids: Object.keys(rowSelection) })
                    }
                    size="sm"
                    variant="destructive"
                  >
                    Vymazať
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
                <FileTextIcon />
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
                  disabled={isCreatingDraftProduct}
                  onClick={() => createDraftProduct()}
                  size="sm"
                  variant="ghost"
                >
                  {isCreatingDraftProduct ? (
                    <>
                      <Spinner />
                      Pridávame produkt...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Pridať produkt
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
