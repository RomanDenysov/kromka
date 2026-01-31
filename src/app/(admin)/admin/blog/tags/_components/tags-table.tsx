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
import { useCallback, useMemo, useState } from "react";
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
import { deleteTagAction } from "@/features/posts/api/actions";
import type { AdminTag } from "@/features/posts/api/queries";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";
import { TagForm } from "./tag-form";

export function TagsTable({ tags }: { tags: AdminTag[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);

  const processedTags = useMemo(() => tags ?? [], [tags]);

  const handleEdit = useCallback((tag: AdminTag) => {
    setEditingTag(tag);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingTag(null);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingTag(null);
    }
  }, []);

  const table = useReactTable<AdminTag>({
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
      const tag = row.original;
      return (
        tag.name.toLowerCase().includes(searchValue) ||
        tag.slug.toLowerCase().includes(searchValue)
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
    data: processedTags,
    getRowId: ({ id }) => id,
    columns,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiSort: true,
    meta: {
      onEdit: handleEdit,
      onDelete: async (id: string) => {
        await deleteTagAction(id);
      },
    },
  });

  const handleBulkDelete = useCallback(async () => {
    for (const id of Object.keys(rowSelection)) {
      await deleteTagAction(id);
    }
    setRowSelection({});
  }, [rowSelection]);

  return (
    <>
      <DataTable table={table}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <DataTableSearch
              onSearch={setGlobalFilter}
              placeholder="Hľadať štítky..."
              value={globalFilter}
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
                    Vymazať {Object.keys(rowSelection).length} štítkov
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Odstrániť štítky</AlertDialogTitle>
                    <AlertDialogDescription>
                      Naozaj chcete odstrániť {Object.keys(rowSelection).length}{" "}
                      štítkov? Táto akcia odstráni štítky zo všetkých článkov.
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
            <Button onClick={handleCreate} size="sm">
              <PlusIcon />
              Nový štítok
            </Button>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </DataTable>
      <TagForm
        onOpenChange={handleFormClose}
        open={formOpen}
        tag={editingTag}
      />
    </>
  );
}
