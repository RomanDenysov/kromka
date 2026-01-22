import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { GuestCustomerInfo } from "@/features/orders/actions/internal";
import { getLastOrderId } from "../cookies";

/**
 * Last order prefill data for checkout form
 * Contains customer info and store ID from the most recent order
 */
export type LastOrderPrefill = {
  customerInfo: GuestCustomerInfo | null;
  storeId: string | null;
};

/** Query columns for order prefill data */
const prefillColumns = {
  customerInfo: true,
  storeId: true,
} as const;

type OrderPrefillRow = {
  customerInfo: {
    name?: string | null;
    email: string;
    phone: string;
  } | null;
  storeId: string | null;
};

function parseCustomerInfo(
  customerInfo: OrderPrefillRow["customerInfo"]
): GuestCustomerInfo | null {
  if (
    !customerInfo ||
    typeof customerInfo.email !== "string" ||
    typeof customerInfo.phone !== "string"
  ) {
    return null;
  }
  return {
    name: customerInfo.name ?? "",
    email: customerInfo.email,
    phone: customerInfo.phone,
  };
}

/**
 * Get the last order prefill data for checkout form
 * For authenticated users: queries by userId
 * For guests: reads from krmk-last-order cookie
 */
export async function getLastOrderPrefill(
  userId?: string
): Promise<LastOrderPrefill | null> {
  let lastOrder: OrderPrefillRow | undefined;

  if (userId) {
    lastOrder = await db.query.orders.findFirst({
      where: eq(orders.createdBy, userId),
      orderBy: [desc(orders.createdAt)],
      columns: prefillColumns,
    });
  } else {
    const lastOrderId = await getLastOrderId();
    if (!lastOrderId) {
      return null;
    }
    lastOrder = await db.query.orders.findFirst({
      where: eq(orders.id, lastOrderId),
      columns: prefillColumns,
    });
  }

  if (!lastOrder) {
    return null;
  }

  return {
    customerInfo: parseCustomerInfo(lastOrder.customerInfo),
    storeId: lastOrder.storeId ?? null,
  };
}

/** Query config for order items with product details */
const orderItemsWithProduct = {
  items: {
    with: {
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          status: true,
          isActive: true,
        },
        with: {
          image: { columns: { url: true } },
          category: { columns: { isActive: true } },
        },
      },
    },
  },
} as const;

type OrderWithItems = Awaited<
  ReturnType<
    typeof db.query.orders.findFirst<{ with: typeof orderItemsWithProduct }>
  >
>;

type OrderItemProduct = NonNullable<
  NonNullable<OrderWithItems>["items"][number]["product"]
>;

function isProductAvailable(product: OrderItemProduct): boolean {
  if (!product.isActive || product.status !== "active") {
    return false;
  }
  return product.category?.isActive !== false;
}

/** Return type for getLastOrderWithItems */
export type LastOrderWithItems = {
  orderId: string;
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    priceCents: number;
    imageUrl: string | null;
    quantity: number;
  }>;
};

/**
 * Get the most recent order with all item details for "repeat order" feature
 * For authenticated users: queries by userId
 * For guests: reads from krmk-last-order cookie
 * Returns items with current product prices, filtering out unavailable products
 */
export async function getLastOrderWithItems(
  userId?: string
): Promise<LastOrderWithItems | null> {
  let lastOrder: OrderWithItems;

  if (userId) {
    lastOrder = await db.query.orders.findFirst({
      where: eq(orders.createdBy, userId),
      orderBy: [desc(orders.createdAt)],
      with: orderItemsWithProduct,
    });
  } else {
    const lastOrderId = await getLastOrderId();
    if (!lastOrderId) {
      return null;
    }
    lastOrder = await db.query.orders.findFirst({
      where: eq(orders.id, lastOrderId),
      with: orderItemsWithProduct,
    });
  }

  if (!lastOrder?.items || lastOrder.items.length === 0) {
    return null;
  }

  const availableItems = lastOrder.items.filter(
    (item) => item.product && isProductAvailable(item.product)
  );

  if (availableItems.length === 0) {
    return null;
  }

  return {
    orderId: lastOrder.id,
    items: availableItems.flatMap((item) => {
      const { product } = item;
      if (!product) {
        return [];
      }
      return [
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          priceCents: product.priceCents,
          imageUrl: product.image?.url ?? null,
          quantity: item.quantity,
        },
      ];
    }),
  };
}
