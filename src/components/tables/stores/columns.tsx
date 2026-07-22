"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArchiveIcon,
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminStore } from "@/features/stores/api/queries";
import { TableColumnHeader } from "@/widgets/data-table/table-column-header";

// biome-ignore lint/style/useConsistentTypeDefinitions: type alias needed for `as` assertion with generic TableMeta
type StoreTableMeta = {
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  toggleActive: (id: string) => void;
};

export const columns: ColumnDef<AdminStore, StoreTableMeta>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),

    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
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
    cell: ({ row }) => (
      <Link
        className={buttonVariants({ variant: "link", size: "xs" })}
        href={`/admin/eshop/stores/${row.original.id}`}
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Stav"
      />
    ),

    meta: {
      label: "Stav",
      variant: "multiSelect",
      options: [
        { label: "Aktívny", value: "true" },
        { label: "Neaktívny", value: "false" },
      ],
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      const rowValue = String(row.getValue(columnId));
      return filterValue.includes(rowValue);
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta as StoreTableMeta;
      return (
        <Button
          className="cursor-pointer"
          onClick={() => meta?.toggleActive(row.original.id)}
          size="xs"
          variant="secondary"
        >
          {row.original.isActive ? (
            <>
              <CheckIcon className="size-3" />
              Aktívny
            </>
          ) : (
            <>
              <XIcon className="size-3" />
              Neaktívny
            </>
          )}
        </Button>
      );
    },
  },
  {
    id: "orders",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Objednávky"
      />
    ),

    meta: {
      label: "Objednávky",
      variant: "number",
    },
    enableSorting: true,
    accessorKey: "ordersCount",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs tracking-tighter">
        {row.original.orders?.length ?? 0}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const meta = table.options.meta as StoreTableMeta;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon-xs" variant="ghost" />}
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<Link href={`/admin/eshop/stores/${row.original.id}`} />}
            >
              <PencilIcon />
              Upraviť
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => meta?.onCopy(row.original.id)}>
              <CopyIcon />
              Kopírovať
            </DropdownMenuItem>
            <AlertDialog key={`delete-${row.original.id}`}>
              <DropdownMenuItem
                asDialogTrigger
                render={<AlertDialogTrigger className="w-full" />}
                variant="destructive"
              >
                <ArchiveIcon />
                Deaktivovať
              </DropdownMenuItem>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deaktivovať obchod</AlertDialogTitle>
                  <AlertDialogDescription>
                    Obchod bude deaktivovaný a skrytý z e-shopu. História
                    objednávok zostane zachovaná a obchod môžete kedykoľvek
                    znova aktivovať.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => meta?.onDelete(row.original.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Deaktivovať
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
