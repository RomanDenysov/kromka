"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminTag } from "@/features/posts/api/queries";
import { TableColumnHeader } from "@/widgets/data-table/table-column-header";

export type TagTableMeta = {
  onEdit: (tag: AdminTag) => void;
  onDelete: (id: string) => void;
};

export const columns: ColumnDef<AdminTag, TagTableMeta>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Vybrať všetky"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Vybrať riadok"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Názov"
      />
    ),
    meta: {
      label: "Názov",
      variant: "text",
    },
    accessorKey: "name",
    enableSorting: true,
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const tag = row.original;
      return (
        <Badge size="sm" variant="secondary">
          {tag.name}
        </Badge>
      );
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Slug"
      />
    ),
    meta: {
      label: "Slug",
      variant: "text",
    },
    accessorKey: "slug",
    enableSorting: true,
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        /{row.original.slug}
      </span>
    ),
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Počet článkov"
      />
    ),
    meta: {
      label: "Počet článkov",
      variant: "number",
    },
    accessorKey: "postCount",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-sm">
        {row.original.postCount}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TagTableMeta;
      const tag = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => meta?.onEdit?.(tag)}>
              <PencilIcon />
              Upraviť
            </DropdownMenuItem>
            <AlertDialog key={`delete-${tag.id}`}>
              <DropdownMenuItem asChild asDialogTrigger variant="destructive">
                <AlertDialogTrigger className="w-full">
                  <Trash2Icon />
                  Vymazať
                </AlertDialogTrigger>
              </DropdownMenuItem>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť štítok</AlertDialogTitle>
                  <AlertDialogDescription>
                    Naozaj chcete odstrániť štítok &quot;{tag.name}&quot;? Táto
                    akcia odstráni štítok zo všetkých článkov.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => meta?.onDelete?.(tag.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Odstrániť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
