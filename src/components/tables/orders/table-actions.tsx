"use client";

import type { Table } from "@tanstack/react-table";
import { format as formatDate } from "date-fns";
import { ArrowDownIcon } from "lucide-react";
import { useState } from "react";
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
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type ExportColumnConfig,
  exportAsCsv,
  exportAsXlsx,
  exportAsXlsxSheets,
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

type OrderItemExportRow = {
  orderNumber: string | null;
  orderId: string;
  orderStatus: Order["orderStatus"];
  customerEmail: string | null;
  storeName: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

const orderItemsExportColumns: ExportColumnConfig<OrderItemExportRow>[] = [
  { key: "orderNumber", header: "Objednávka" },
  // { key: "orderId", header: "Order ID" },
  { key: "orderStatus", header: "Stav" },
  { key: "customerEmail", header: "Email zákazníka" },
  { key: "storeName", header: "Predajňa" },
  {
    key: "pickupDate",
    header: "Vyzdvihnúťie",
    format: (value) =>
      typeof value === "string" && value
        ? formatDate(new Date(value), "dd.MM.yyyy HH:mm")
        : "",
  },
  { key: "pickupTime", header: "Čas vyzdvihnutia" },
  // { key: "productId", header: "Produkt ID" },
  { key: "productName", header: "Produkt" },
  { key: "quantity", header: "Množstvo" },
  {
    key: "unitPriceCents",
    header: "Cena/ks (EUR)",
    format: (value) =>
      // biome-ignore lint/style/noMagicNumbers: Ignore it for now
      typeof value === "number" ? (value / 100).toFixed(2) : "",
  },
  {
    key: "lineTotalCents",
    header: "Spolu (EUR)",
    format: (value) =>
      // biome-ignore lint/style/noMagicNumbers: Ignore it for now
      typeof value === "number" ? (value / 100).toFixed(2) : "",
  },
];

export function OrdersTableActions({ table }: { table: Table<Order> }) {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("xlsx");
  const [includeProducts, setIncludeProducts] = useState(true);

  const handleExport = async (format: "csv" | "xlsx") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const exportData = selectedRows.length
      ? selectedRows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original);

    if (!exportData.length) {
      return;
    }

    if (includeProducts) {
      const itemRows: OrderItemExportRow[] = exportData.flatMap((order) => {
        const customerEmail =
          order.createdBy?.email ?? order.customerInfo?.email ?? null;

        const storeName = order.store?.name ?? null;
        const pickupDate = order.pickupDate ?? null;
        const pickupTime = order.pickupTime ?? null;

        const items = order.items ?? [];
        if (items.length === 0) {
          return [];
        }

        return items.map((item) => {
          const productName =
            item.product?.name ??
            item.productSnapshot?.name ??
            "Neznámy produkt";

          const unitPriceCents =
            typeof item.price === "number" ? item.price : 0;
          const quantity =
            typeof item.quantity === "number" ? item.quantity : 0;

          return {
            orderNumber: order.orderNumber,
            orderId: order.id,
            orderStatus: order.orderStatus,
            customerEmail,
            storeName,
            pickupDate,
            pickupTime,
            productId: item.productId,
            productName,
            quantity,
            unitPriceCents,
            lineTotalCents: unitPriceCents * quantity,
          };
        });
      });

      if (format === "csv") {
        exportAsCsv(itemRows, orderItemsExportColumns, "orders-items");
      } else {
        await exportAsXlsxSheets(
          [
            { name: "Orders", rows: exportData, columns: orderExportColumns },
            { name: "Items", rows: itemRows, columns: orderItemsExportColumns },
          ],
          "orders"
        );
      }
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
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <ArrowDownIcon />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export</DialogTitle>
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
            <Field
              className="rounded-md border bg-card px-4 py-3"
              orientation="horizontal"
            >
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
