"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircleIcon,
  LockIcon,
  MoreHorizontalIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import { TableColumnHeader } from "@/components/data-table/table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserList } from "@/lib/queries/users";
import { cn, getInitials } from "@/lib/utils";

type UserTableMeta = {
  onOpen: (id: string) => void;
  onLock: (id: string) => void;
};

export const columns: ColumnDef<UserList[number], UserTableMeta>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
  },
  {
    id: "image",
    header: "",
    accessorKey: "image",
    cell: ({ row }) => (
      <Avatar className="relative size-8 rounded-md">
        <AvatarImage
          className="rounded-md object-cover"
          src={row.original?.image ?? ""}
        />
        <AvatarFallback className="rounded-md" delayMs={300}>
          {getInitials(row.original?.name || row.original?.email)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    id: "email",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Email"
      />
    ),
    enableGlobalFilter: true,
    enableColumnFilter: true,
    accessorKey: "email",
    enableSorting: true,
    filterFn: "fuzzy",
    cell: ({ row }) => (
      <span
        className={cn(
          "flex items-center gap-0.5 font-medium text-xs",
          row.original.name.length > 0 && "cursor-pointer"
        )}
      >
        {row.original.email}
        {row.original?.emailVerified && (
          <CheckCircleIcon className="size-3 text-green-800" />
        )}
      </span>
    ),
  },
  {
    id: "kontakt",
    header: "Kontaktne údaje",
    accessorKey: "phone",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        {!row.original.isAnonymous && (
          <span className="font-medium text-xs">{row.original.name}</span>
        )}
        {row.original.phone ? (
          <span className="truncate font-medium text-xs">
            {row.original.phone}
          </span>
        ) : (
          <span className="font-medium text-xs">---</span>
        )}
      </div>
    ),
  },
  {
    id: "role",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Pozícia"
      />
    ),
    enableSorting: true,
    accessorKey: "role",
    cell: ({ row }) => (
      <Badge size="xs" variant="outline">
        {row.original.role ?? "Uživatel"}
      </Badge>
    ),
  },
  {
    id: "isAnonymous",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Anonymní"
      />
    ),
    accessorKey: "isAnonymous",
    cell: ({ row }) => (
      <Badge
        size="xs"
        variant={row.original.isAnonymous ? "outline" : "success"}
      >
        {row.original.isAnonymous ? "Áno" : "Nie"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Registrovaný"
      />
    ),
    enableSorting: true,
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    meta: {
      className:
        "text-right sticky right-0 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-30 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:left-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta as UserTableMeta;
      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="relative">
              <Button size="icon-xs" variant="ghost">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meta?.onOpen(row.original.id)}>
                <SquareArrowOutUpRightIcon />
                Otvoriť
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => meta?.onLock(row.original.id)}>
                <LockIcon />
                Blokovať
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
