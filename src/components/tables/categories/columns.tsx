import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/types/categories";

export const columns: ColumnDef<Category>[] = [
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
    header: "Názov",
    accessorKey: "name",
    cell: ({ row }) => (
      <Link
        className={buttonVariants({ variant: "link", size: "xs" })}
        href={`categories?categoryId=${row.original.id}` as Route}
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    header: "Stav",
    accessorKey: "isActive",
    cell: ({ row }) => (
      <Badge size="xs" variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Aktívny" : "Neaktívny"}
      </Badge>
    ),
  },
  {
    header: "Vytvorené",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
];
