"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ExternalLinkIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminPostList } from "@/features/posts/api/queries";
import { TableColumnHeader } from "@/widgets/data-table/table-column-header";
import { StatusBadge } from "./status-badge";

type AdminPost = AdminPostList["posts"][number];

export type PostTableMeta = {
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
};

export const columns: ColumnDef<AdminPost, PostTableMeta>[] = [
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
    id: "image",
    header: "Obrázok",
    meta: {
      label: "Obrázok",
      variant: "text",
    },
    accessorKey: "coverImageUrl",
    cell: ({ row }) => {
      const post = row.original;
      const image = post.coverImageUrl;
      return image ? (
        <Image
          alt={post.title ?? "Náhľad"}
          className="rounded-sm object-cover"
          height={60}
          quality={60}
          src={image}
          width={80}
        />
      ) : (
        <div className="flex h-[60px] w-[80px] items-center justify-center rounded-sm bg-muted">
          <ImageIcon className="size-6 stroke-2 text-muted-foreground" />
        </div>
      );
    },
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
    accessorKey: "title",
    enableSorting: true,
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <Link
            className={buttonVariants({ variant: "link", size: "xs" })}
            href={`/admin/blog/posts/${post.id}`}
          >
            {post.title ?? "Bez názvu"}
          </Link>
          {post.slug && (
            <span className="text-muted-foreground text-xs">/{post.slug}</span>
          )}
        </div>
      );
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Status"
      />
    ),
    accessorKey: "status",
    enableSorting: true,
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Návrh", value: "draft" },
        { label: "Publikovaný", value: "published" },
        { label: "Archivovaný", value: "archived" },
      ],
    },
    enableGlobalFilter: true,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: "Autor",
    meta: {
      label: "Autor",
      variant: "text",
    },
    accessorKey: "author",
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <span className="text-muted-foreground text-sm">
          {author?.name ?? "Neznámy"}
        </span>
      );
    },
  },
  {
    header: "Štítky",
    meta: {
      label: "Štítky",
      variant: "text",
    },
    accessorKey: "tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) {
        return <span className="text-muted-foreground text-xs">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} size="xs" variant="outline">
              {tag.name}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge size="xs" variant="secondary">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Vytvorené"
      />
    ),
    meta: {
      label: "Vytvorené",
      variant: "date",
    },
    accessorKey: "createdAt",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    header: ({ column, table }) => (
      <TableColumnHeader
        column={column}
        key={`${column.id}-${table.getState().sorting.find((s) => s.id === column.id)?.desc ?? "none"}`}
        title="Publikované"
      />
    ),
    meta: {
      label: "Publikované",
      variant: "date",
    },
    accessorKey: "publishedAt",
    enableSorting: true,
    cell: ({ row }) => {
      const publishedAt = row.original.publishedAt;
      return publishedAt ? (
        <span className="font-medium font-mono text-xs">
          {format(publishedAt, "dd.MM.yyyy")}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as PostTableMeta;
      const post = row.original;
      const isPublished = post.status === "published";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/blog/posts/${post.id}`}>
                <PencilIcon />
                Upraviť
              </Link>
            </DropdownMenuItem>
            {isPublished && post.slug && (
              <DropdownMenuItem asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <ExternalLinkIcon />
                  Zobraziť na webe
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isPublished ? (
              <DropdownMenuItem
                onClick={() => meta?.onUnpublish?.(post.id)}
                variant="destructive"
              >
                Odložiť
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => meta?.onPublish?.(post.id)}>
                Publikovať
              </DropdownMenuItem>
            )}
            <AlertDialog key={`delete-${post.id}`}>
              <DropdownMenuItem asChild asDialogTrigger variant="destructive">
                <AlertDialogTrigger className="w-full">
                  <Trash2Icon />
                  Vymazať
                </AlertDialogTrigger>
              </DropdownMenuItem>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť článok</AlertDialogTitle>
                  <AlertDialogDescription>
                    Naozaj chcete odstrániť tento článok? Táto akcia je
                    nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => meta?.onDelete?.(post.id)}
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
