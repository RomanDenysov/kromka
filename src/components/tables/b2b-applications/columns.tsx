"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { B2bApplication } from "@/features/b2b/applications/api/queries";

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Čaká", variant: "secondary" },
  approved: { label: "Schválená", variant: "default" },
  rejected: { label: "Zamietnutá", variant: "destructive" },
};

export const columns: ColumnDef<B2bApplication>[] = [
  {
    accessorKey: "companyName",
    header: "Spoločnosť",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.companyName}</div>
    ),
  },
  {
    accessorKey: "contactName",
    header: "Kontakt",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-sm">{row.original.contactName}</div>
        <div className="text-muted-foreground text-xs">
          {row.original.contactEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ico",
    header: "IČO",
    cell: ({ row }) => <div className="text-sm">{row.original.ico}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = STATUS_LABELS[status] ?? {
        label: status,
        variant: "outline" as const,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dátum",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.original.createdAt), "d. MMM yyyy", {
          locale: sk,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as
        | { onOpen?: (id: string) => void }
        | undefined;
      return (
        <Button
          onClick={() => {
            meta?.onOpen?.(row.original.id);
          }}
          size="xs"
          variant="ghost"
        >
          <ArrowRightIcon />
        </Button>
      );
    },
  },
];
