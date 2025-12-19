"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDownIcon } from "lucide-react";
import { useCallback, useState } from "react";
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
import {
  bakingSheetColumns,
  buildBakingSheet,
  buildFulfillmentSheet,
  buildOrderItemsSheet,
  fulfillmentColumns,
  orderExportColumns,
  orderItemsExportColumns,
} from "./export-order-utils";

export function OrdersTableActions({ table }: { table: Table<Order> }) {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("xlsx");
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeBakingSheet, setIncludeBakingSheet] = useState(true);
  const [includeFulfillment, setIncludeFulfillment] = useState(true);

  const handleExport = useCallback(
    async (format: "csv" | "xlsx") => {
      const exportData = table
        .getFilteredSelectedRowModel()
        .rows.map((r) => r.original);

      if (!exportData.length) {
        return;
      }

      if (format === "xlsx") {
        const sheets: Parameters<typeof exportAsXlsxSheets>[0] = [
          { name: "Objednávky", rows: exportData, columns: orderExportColumns },
        ];

        if (includeProducts) {
          const itemRows = buildOrderItemsSheet(exportData);
          sheets.push({
            name: "Produkty",
            rows: itemRows,
            columns: orderItemsExportColumns,
          });
        }

        if (includeBakingSheet) {
          sheets.push({
            name: "Pre pekáreň",
            rows: buildBakingSheet(exportData),
            columns: bakingSheetColumns,
          });
        }

        if (includeFulfillment) {
          sheets.push({
            name: "Pre výdaj",
            rows: buildFulfillmentSheet(exportData),
            columns: fulfillmentColumns,
          });
        }

        await exportAsXlsxSheets(sheets, "orders");
      } else {
        // CSV — можна експортувати тільки один лист
        exportAsCsv(exportData, orderExportColumns, "orders");
      }
    },
    [table, includeProducts, includeBakingSheet, includeFulfillment]
  );

  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <ArrowDownIcon />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export objednávok</DialogTitle>
            <DialogDescription>
              Exportujte vybrané objednávky do CSV alebo XLSX. Vyberte formát
              exportu a stlačte tlačidlo Export.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <RadioGroup
              className="grid-cols-2"
              defaultValue="xlsx"
              onValueChange={(value) =>
                setExportFormat(value as "csv" | "xlsx")
              }
            >
              <FieldLabel htmlFor="xlsx">
                <RadioGroupItem
                  className="peer sr-only"
                  id="xlsx"
                  value="xlsx"
                />
                <Field>
                  <FieldContent>
                    <FieldTitle>XLSX</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>

              <FieldLabel htmlFor="csv">
                <Field>
                  <FieldContent>
                    <FieldTitle>CSV</FieldTitle>
                  </FieldContent>
                </Field>
                <RadioGroupItem className="peer sr-only" id="csv" value="csv" />
              </FieldLabel>
            </RadioGroup>
            <FieldGroup
              className="gap-4 rounded-md border p-3"
              data-slot="checkbox-group"
            >
              <Field orientation="horizontal">
                <Checkbox
                  checked={includeProducts}
                  id="add-products"
                  name="add-products"
                  onCheckedChange={(value) => setIncludeProducts(!!value)}
                />
                <FieldContent>
                  <FieldLabel>Produkty</FieldLabel>
                  <FieldDescription>
                    Pridáte produkty do exportu.
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  checked={includeBakingSheet}
                  id="baking-sheet"
                  onCheckedChange={(v) => setIncludeBakingSheet(!!v)}
                />
                <FieldContent>
                  <FieldLabel>Pre pekáreň</FieldLabel>
                  <FieldDescription>
                    Súhrn produktov podľa dátumu a času
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  checked={includeFulfillment}
                  id="fulfillment"
                  onCheckedChange={(v) => setIncludeFulfillment(!!v)}
                />
                <FieldContent>
                  <FieldLabel>Pre výdaj</FieldLabel>
                  <FieldDescription>
                    Prehľad pre výdaj objednávok podľa dátumu a času
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Zrušiť</Button>
            </DialogClose>
            <Button onClick={() => handleExport(exportFormat)}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
