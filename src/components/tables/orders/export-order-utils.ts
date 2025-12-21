import { formatDate } from "date-fns";
import { sk } from "date-fns/locale";
import type { OrderStatus } from "@/db/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { ExportColumnConfig } from "@/lib/export-utils";
import type { Order } from "@/lib/queries/orders";

type OrderItemExportRow = {
  orderNumber: string | null;
  orderId: string;
  orderStatus: Order["orderStatus"];
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  storeName: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type BakingSheetRow = {
  pickupDate: string;
  productName: string;
  totalQuantity: number;
};

type FulfillmentRow = {
  rowType: "order" | "item";
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupDate: string;
  pickupTime: string;
  storeName: string;
  productName: string;
  quantity: string; // "3 ks" for order, "3" for item
  unitPrice: string; // empty for order
  lineTotal: string;
};

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export const orderExportColumns: ExportColumnConfig<Order>[] = [
  {
    key: "orderNumber",
    header: "Objednávka",
  },
  {
    key: "orderStatus",
    header: "Stav",
    format: (value) => (value ? ORDER_STATUS_LABELS[value as OrderStatus] : ""),
  },
  // TODO: Add info about payment status after payment provider integration
  {
    header: "Meno zákazníka",
    key: "customerInfo.name",
    format: (_value, order) =>
      order.customerInfo?.name ?? order.createdBy?.name ?? "",
  },
  {
    header: "Email zákazníka",
    key: "createdBy.email",
    format: (_value, order) =>
      order.customerInfo?.email ?? order.createdBy?.email ?? "",
  },
  {
    header: "Telefón zákazníka",
    key: "customerInfo.phone",
    format: (_value, order) =>
      order.customerInfo?.phone ?? order.createdBy?.phone ?? "",
  },
  {
    key: "store.name",
    header: "Predajňa",
  },
  {
    key: "pickupDate",
    header: "Vyzdvihnúťie",
    format: (value) => formatDate(value, "dd.MM.yyyy HH:mm", { locale: sk }),
  },
  {
    key: "pickupTime",
    header: "Čas vyzdvihnutia",
  },
  {
    key: "totalCents",
    header: "Spolu (EUR)",
    format: (value) => (typeof value === "number" ? formatPrice(value) : ""),
  },
  {
    key: "createdAt",
    header: "Vytvorené",
    format: (value) =>
      value instanceof Date
        ? formatDate(value, "dd.MM.yyyy HH:mm", { locale: sk })
        : "",
  },
];

export const orderItemsExportColumns: ExportColumnConfig<OrderItemExportRow>[] =
  [
    { key: "orderNumber", header: "Objednávka" },
    // { key: "orderId", header: "Order ID" },
    { key: "orderStatus", header: "Stav" },
    { key: "customerName", header: "Meno zákazníka" },
    { key: "customerEmail", header: "Email zákazníka" },
    { key: "customerPhone", header: "Telefón zákazníka" },
    { key: "storeName", header: "Predajňa" },
    {
      key: "pickupDate",
      header: "Vyzdvihnúťie",
      format: (value) =>
        typeof value === "string" && value
          ? formatDate(new Date(value), "dd.MM.yyyy HH:mm", { locale: sk })
          : "",
    },
    { key: "pickupTime", header: "Čas vyzdvihnutia" },
    // { key: "productId", header: "Produkt ID" },
    { key: "productName", header: "Produkt" },
    { key: "quantity", header: "Množstvo" },
    {
      key: "unitPriceCents",
      header: "Cena/ks (EUR)",
      format: (value) => (typeof value === "number" ? formatPrice(value) : ""),
    },
    {
      key: "lineTotalCents",
      header: "Spolu (EUR)",
      format: (value) => (typeof value === "number" ? formatPrice(value) : ""),
    },
  ];

export const bakingSheetColumns: ExportColumnConfig<BakingSheetRow>[] = [
  {
    key: "pickupDate",
    header: "Dátum",
    format: (value) =>
      typeof value === "string" && value
        ? formatDate(new Date(value), "dd.MM.yyyy (EEEE)", { locale: sk })
        : "",
  },
  { key: "productName", header: "Produkt" },
  { key: "totalQuantity", header: "Množstvo" },
];

export const fulfillmentColumns: ExportColumnConfig<FulfillmentRow>[] = [
  { key: "orderNumber", header: "Objednávka" },
  { key: "customerName", header: "Meno" },
  { key: "customerPhone", header: "Telefón" },
  { key: "customerEmail", header: "Email" },
  { key: "storeName", header: "Predajňa" },
  {
    key: "pickupDate",
    header: "Dátum",
    format: (value) =>
      typeof value === "string" && value
        ? formatDate(new Date(value), "dd.MM.yyyy")
        : "",
  },
  { key: "pickupTime", header: "Čas" },
  { key: "productName", header: "Produkt" },
  { key: "quantity", header: "Množstvo" },
  { key: "unitPrice", header: "Cena/ks" },
  { key: "lineTotal", header: "Spolu" },
];

export function buildBakingSheet(orders: Order[]): BakingSheetRow[] {
  const map = new Map<string, BakingSheetRow>();

  for (const order of orders) {
    // Skip cancelled orders to match dashboard aggregation logic
    if (order.orderStatus === "cancelled") {
      continue;
    }

    const date = order.pickupDate ?? "unknown";
    for (const item of order.items ?? []) {
      const productName =
        item.product?.name ?? item.productSnapshot?.name ?? "Neznámy produkt";
      // Use productId as key to avoid name collision issues
      const key = `${date}|${item.productId}`;

      const existing = map.get(key);
      if (existing) {
        existing.totalQuantity += item.quantity ?? 0;
      } else {
        map.set(key, {
          pickupDate: date,
          productName,
          totalQuantity: item.quantity ?? 0,
        });
      }
    }
  }

  // Sorting by date, then by product name
  return Array.from(map.values()).sort((a, b) => {
    const dateCompare = a.pickupDate.localeCompare(b.pickupDate);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return a.productName.localeCompare(b.productName);
  });
}

export function buildFulfillmentSheet(orders: Order[]): FulfillmentRow[] {
  const rows: FulfillmentRow[] = [];

  // Filter out cancelled orders and sort by date -> time
  const sorted = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .sort((a, b) => {
      const dateCompare = (a.pickupDate ?? "").localeCompare(
        b.pickupDate ?? ""
      );
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return (a.pickupTime ?? "").localeCompare(b.pickupTime ?? "");
    });

  for (const order of sorted) {
    const items = order.items ?? [];
    const totalItems = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

    // Header row (order)
    rows.push({
      rowType: "order",
      orderNumber: order.orderNumber ?? "",
      customerName: order.customerInfo?.name ?? order.createdBy?.name ?? "",
      customerPhone: order.customerInfo?.phone ?? order.createdBy?.phone ?? "",
      customerEmail: order.customerInfo?.email ?? order.createdBy?.email ?? "",
      pickupDate: order.pickupDate ?? "",
      pickupTime: order.pickupTime ?? "",
      storeName: order.store?.name ?? "",
      productName: "",
      quantity: `${totalItems} ks`,
      unitPrice: "",
      lineTotal: formatPrice(order.totalCents),
    });

    // Detail rows (items)
    for (const item of items) {
      const unitPrice = item.price ?? 0;
      const qty = item.quantity ?? 0;

      rows.push({
        rowType: "item",
        orderNumber: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        pickupDate: "",
        pickupTime: "",
        storeName: "",
        productName:
          item.product?.name ?? item.productSnapshot?.name ?? "Neznámy",
        quantity: String(qty),
        unitPrice: formatPrice(unitPrice),
        lineTotal: formatPrice(unitPrice * qty),
      });
    }
  }

  return rows;
}

export function buildOrderItemsSheet(orders: Order[]): OrderItemExportRow[] {
  return orders
    .filter((order) => order.orderStatus !== "cancelled")
    .flatMap((order) => {
      const customerName =
        order.customerInfo?.name ?? order.createdBy?.name ?? null;
      const customerEmail =
        order.customerInfo?.email ?? order.createdBy?.email ?? null;
      const customerPhone =
        order.customerInfo?.phone ?? order.createdBy?.phone ?? null;

      const storeName = order.store?.name ?? null;
      const pickupDate = order.pickupDate ?? null;
      const pickupTime = order.pickupTime ?? null;

      const items = order.items ?? [];
      if (items.length === 0) {
        return [];
      }

      return items.map((item) => {
        const productName =
          item.product?.name ?? item.productSnapshot?.name ?? "Neznámy produkt";

        const unitPriceCents = typeof item.price === "number" ? item.price : 0;
        const quantity = typeof item.quantity === "number" ? item.quantity : 0;

        return {
          orderNumber: order.orderNumber,
          orderId: order.id,
          orderStatus: order.orderStatus,
          customerName,
          customerEmail,
          customerPhone,
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
}
