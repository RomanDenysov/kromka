"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/features/b2b/clients/queries";
import { formatPrice } from "@/lib/utils";

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Názov",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "billingEmail",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.billingEmail ?? "-"}</div>
    ),
  },
  {
    accessorKey: "priceTier",
    header: "Cenová skupina",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.priceTier?.name ?? "Nepriradená"}
      </div>
    ),
  },
  {
    accessorKey: "orderCount",
    header: "Objednávky",
    cell: ({ row }) => <div className="text-sm">{row.original.orderCount}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: "Tržby",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatPrice(row.original.totalRevenue ?? 0)}
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
