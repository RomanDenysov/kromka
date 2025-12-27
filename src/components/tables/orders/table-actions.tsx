"use client";

import { ArrowDownIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { exportAsCsv, exportAsXlsxSheets } from "@/lib/export-utils";
import type { Order } from "@/lib/queries/orders";
import { BulkEditDialog } from "./bulk-edit-dialog";
import {
  bakingSheetColumns,
  buildBakingSheet,
  buildFulfillmentSheet,
  buildOrderItemsSheet,
  fulfillmentColumns,
  orderExportColumns,
  orderItemsExportColumns,
} from "./export-order-utils";

type ExportFormat = "csv" | "xlsx";

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
}[] = [
  { value: "xlsx", label: "XLSX" },
  { value: "csv", label: "CSV" },
];

const SHEET_OPTIONS = [
  {
    id: "products",
    label: "Produkty",
    description: "Pridáte produkty do exportu.",
  },
  {
    id: "baking",
    label: "Pre pekáreň",
    description: "Súhrn produktov podľa dátumu a času",
  },
  {
    id: "fulfillment",
    label: "Pre výdaj",
    description: "Prehľad pre výdaj objednávok podľa dátumu a času",
  },
] as const;

type SheetId = (typeof SHEET_OPTIONS)[number]["id"];

type OrdersTableActionsProps = {
  filteredOrders: Order[];
  selectedOrders: Order[];
  resetSelection: () => void;
};

export function OrdersTableActions({
  filteredOrders,
  selectedOrders,
  resetSelection,
}: OrdersTableActionsProps) {
  const [open, setOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [sheets, setSheets] = useState<Record<SheetId, boolean>>({
    products: true,
    baking: true,
    fulfillment: true,
  });

  const hasSelection = selectedOrders.length > 0;
  const selectedOrderIds = selectedOrders.map((o) => o.id);
  const exportCount = hasSelection
    ? selectedOrders.length
    : filteredOrders.length;

  const getOrders = () => (hasSelection ? selectedOrders : filteredOrders);

  const toggleSheet = (id: SheetId) => {
    setSheets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async () => {
    const orders = getOrders();

    if (!orders.length) {
      toast.error("Žiadne dáta na export");
      return;
    }

    try {
      if (format === "csv") {
        exportAsCsv(orders, orderExportColumns, "orders");
      } else {
        const xlsxSheets: Parameters<typeof exportAsXlsxSheets>[0] = [
          { name: "Objednávky", rows: orders, columns: orderExportColumns },
        ];

        if (sheets.products) {
          xlsxSheets.push({
            name: "Produkty",
            rows: buildOrderItemsSheet(orders),
            columns: orderItemsExportColumns,
          });
        }
        if (sheets.baking) {
          xlsxSheets.push({
            name: "Pre pekáreň",
            rows: buildBakingSheet(orders),
            columns: bakingSheetColumns,
          });
        }
        if (sheets.fulfillment) {
          xlsxSheets.push({
            name: "Pre výdaj",
            rows: buildFulfillmentSheet(orders),
            columns: fulfillmentColumns,
          });
        }

        await exportAsXlsxSheets(xlsxSheets, "orders");
      }

      toast.success(
        `Exportovaných ${orders.length} objednávok (${format.toUpperCase()})`
      );
      setOpen(false);
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export sa nepodaril");
    }
  };

  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      {hasSelection && (
        <Button
          onClick={() => setBulkEditOpen(true)}
          size="sm"
          variant="outline"
        >
          <PencilIcon />
          Upraviť ({selectedOrderIds.length})
        </Button>
      )}

      <BulkEditDialog
        onOpenChange={setBulkEditOpen}
        onSuccess={resetSelection}
        open={bulkEditOpen}
        selectedOrderIds={selectedOrderIds}
      />

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <ArrowDownIcon />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export objednávok ({exportCount})</DialogTitle>
            <DialogDescription>
              {hasSelection
                ? `Exportujte ${exportCount} vybraných objednávok.`
                : `Exportujte všetkých ${exportCount} odfiltrovaných objednávok.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <RadioGroup
              className="grid grid-cols-2 gap-4"
              onValueChange={(v) => setFormat(v as ExportFormat)}
              value={format}
            >
              {FORMAT_OPTIONS.map((opt) => (
                <FieldLabel htmlFor={opt.value} key={opt.value}>
                  <RadioGroupItem
                    className="peer sr-only"
                    id={opt.value}
                    value={opt.value}
                  />
                  <Field>
                    <FieldContent>
                      <FieldTitle>{opt.label}</FieldTitle>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>

            <FieldGroup
              className="gap-4 rounded-md border p-3"
              data-slot="checkbox-group"
            >
              {SHEET_OPTIONS.map((opt) => (
                <Field key={opt.id} orientation="horizontal">
                  <Checkbox
                    checked={sheets[opt.id]}
                    id={opt.id}
                    onCheckedChange={() => toggleSheet(opt.id)}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={opt.id}>{opt.label}</FieldLabel>
                    <FieldDescription>{opt.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </FieldGroup>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Zrušiť</Button>
            </DialogClose>
            <Button onClick={handleExport}>Exportovať</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
