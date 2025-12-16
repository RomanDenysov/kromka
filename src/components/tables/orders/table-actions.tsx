"use client";

import type { Table } from "@tanstack/react-table";
import { format as formatDate } from "date-fns";
import { ArrowDownIcon, FileIcon, TablePropertiesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
} from "@/lib/export-utils";
import type { Order } from "@/lib/queries/orders";

const orderExportColumns: ExportColumnConfig<Order>[] = [
  {
    key: "orderNumber",
    header: "Objednávka",
  },
  {
    key: "orderStatus",
    header: "Stav",
  },
  {
    key: "createdBy.email",
    header: "Email zákazníka",
  },
  {
    key: "store.name",
    header: "Predajňa",
  },
  {
    key: "pickupDate",
    header: "Vyzdvihnúťie",
    format: (value) => formatDate(value, "dd.MM.yyyy HH:mm"),
  },
  {
    key: "pickupTime",
    header: "Čas vyzdvihnutia",
  },
  {
    key: "totalCents",
    header: "Spolu (EUR)",
    format: (value) =>
      // biome-ignore lint/style/noMagicNumbers: Ignore it for now
      typeof value === "number" ? (value / 100).toFixed(2) : "",
  },
  {
    key: "createdAt",
    header: "Vytvorené",
    format: (value) =>
      value instanceof Date ? value.toLocaleString("sk-SK") : "",
  },
];

export function OrdersTableActions({ table }: { table: Table<Order> }) {
  const handleExport = async (format: "csv" | "xlsx") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const exportData = selectedRows.length
      ? selectedRows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original);

    if (!exportData.length) {
      return;
    }

    if (format === "csv") {
      exportAsCsv(exportData, orderExportColumns, "orders");
    } else {
      await exportAsXlsx(exportData, orderExportColumns, "orders");
    }
  };

  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <ArrowDownIcon />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <FileIcon />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("xlsx")}>
            <TablePropertiesIcon />
            XLSX
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
