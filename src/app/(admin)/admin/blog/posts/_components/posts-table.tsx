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
import { useCallback, useMemo, useState, useTransition } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import {
  createPostAction,
  deletePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@/features/posts/api/actions";
import type { AdminPostList } from "@/features/posts/api/queries";
import { DataTable } from "@/widgets/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/widgets/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/widgets/data-table/data-table-search";
import { DataTableViewOptions } from "@/widgets/data-table/data-table-view-options";
import { columns } from "./columns";

type AdminPost = AdminPostList["posts"][number];

export function PostsTable({ posts }: { posts: AdminPost[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const processedPosts = useMemo(() => posts ?? [], [posts]);

  const table = useReactTable<AdminPost>({
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
      const post = row.original;
      return (
        post.title?.toLowerCase().includes(searchValue) ||
        post.slug?.toLowerCase().includes(searchValue) ||
        post.author?.name?.toLowerCase().includes(searchValue) ||
        post.tags?.some((tag) => tag.name.toLowerCase().includes(searchValue))
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
    data: processedPosts,
    getRowId: ({ id }) => id,
    columns,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiSort: true,
    meta: {
      onDelete: async (id: string) => {
        await deletePostAction(id);
      },
      onPublish: async (id: string) => {
        await publishPostAction(id);
      },
      onUnpublish: async (id: string) => {
        await unpublishPostAction(id);
      },
    },
  });

  const handleBulkDelete = useCallback(async () => {
    for (const id of Object.keys(rowSelection)) {
      await deletePostAction(id);
    }
    setRowSelection({});
  }, [rowSelection]);

  const statusOptions = [
    { label: "Návrh", value: "draft" },
    { label: "Publikovaný", value: "published" },
    { label: "Archivovaný", value: "archived" },
  ];

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
            placeholder="Hľadať články, autori, štítky..."
            value={globalFilter}
          />
          <DataTableMultiSelectFilter
            columnId="status"
            options={statusOptions}
            table={table}
            title="Status"
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
                  Vymazať {Object.keys(rowSelection).length} článkov
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť články</AlertDialogTitle>
                  <AlertDialogDescription>
                    Naozaj chcete odstrániť {Object.keys(rowSelection).length}{" "}
                    článkov? Táto akcia je nevratná.
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
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await createPostAction();
              })
            }
            size="sm"
          >
            {isPending ? (
              <>
                <Spinner />
                Vytváranie...
              </>
            ) : (
              <>
                <PlusIcon />
                Nový článok
              </>
            )}
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </DataTable>
  );
}
