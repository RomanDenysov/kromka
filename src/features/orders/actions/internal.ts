"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import type { PaymentMethod } from "@/db/types";
import { clearCart, getCart } from "@/features/cart/cookies";
import { sendEmail } from "@/lib/email";
import { createPrefixedNumericId } from "@/lib/ids";
import { getEffectivePrices } from "@/lib/pricing";
import { getOrderById } from "../api/queries";

export type OrderItemData = {
  productId: string;
  productSnapshot: { name: string; price: number };
  price: number;
  quantity: number;
};

export type GuestCustomerInfo = {
  name: string;
  email: string;
  phone: string;
};

export function isValidGuestInfo(info: GuestCustomerInfo): boolean {
  return Boolean(info.name.trim() && info.email.trim() && info.phone.trim());
}

/**
 * Build order items from cart with optional tier pricing.
 */
export async function buildOrderItems(
  cartItems: Awaited<ReturnType<typeof getCart>>,
  priceTierId: string | null
): Promise<OrderItemData[]> {
  const productIds = cartItems.map((item) => item.productId);
  const productData = await db.query.products.findMany({
    where: inArray(products.id, productIds),
  });

  const productPrices = productData.map((p) => ({
    productId: p.id,
    basePriceCents: p.priceCents,
  }));
  const effectivePrices =
    priceTierId && productPrices.length > 0
      ? await getEffectivePrices({ productPrices, priceTierId })
      : new Map<string, number>();

  return cartItems.flatMap((item) => {
    const product = productData.find((p) => p.id === item.productId);
    if (!product) {
      return [];
    }

    const effectivePrice =
      effectivePrices.get(product.id) ?? product.priceCents;

    return [
      {
        productId: item.productId,
        productSnapshot: { name: product.name, price: effectivePrice },
        price: effectivePrice,
        quantity: item.qty,
      },
    ];
  });
}

/**
 * Validate that store exists.
 */
export async function validateStoreExists(storeId: string): Promise<
  | {
      success: false;
      error: string;
    }
  | { success: true }
> {
  const storeExists = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: { id: true },
  });

  if (!storeExists) {
    return { success: false, error: "Vybraná predajňa neexistuje" };
  }

  return { success: true };
}

/**
 * Validate that cart is not empty.
 */
export async function validateCart(): Promise<
  | {
      success: false;
      error: string;
    }
  | { success: true; cartItems: Awaited<ReturnType<typeof getCart>> }
> {
  const cartItems = await getCart();
  if (cartItems.length === 0) {
    return { success: false, error: "Košík je prázdny" };
  }

  return { success: true, cartItems };
}

type PersistOrderParams = {
  userId: string | null;
  customerInfo: GuestCustomerInfo;
  storeId: string;
  companyId: string | null;
  paymentMethod: PaymentMethod;
  pickupDate: string;
  pickupTime: string;
  totalCents: number;
  orderItemsData: OrderItemData[];
};

/**
 * Persist order to database: create order, items, and status event.
 */
export async function persistOrder(params: PersistOrderParams): Promise<{
  orderId: string;
  orderNumber: string;
}> {
  const orderNumber = createPrefixedNumericId("OBJ");

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      createdBy: params.userId,
      customerInfo: params.customerInfo,
      storeId: params.storeId,
      companyId: params.companyId,
      orderStatus: "new",
      paymentStatus: "pending",
      paymentMethod: params.paymentMethod,
      pickupDate: params.pickupDate,
      pickupTime: params.pickupTime,
      totalCents: params.totalCents,
    })
    .returning();

  await db
    .insert(orderItems)
    .values(
      params.orderItemsData.map((item) => ({ ...item, orderId: order.id }))
    );

  await db.insert(orderStatusEvents).values({
    orderId: order.id,
    status: "new",
    createdBy: params.userId,
  });

  return { orderId: order.id, orderNumber };
}

/**
 * Send order creation notifications (new order email to staff, receipt to customer).
 */
export async function notifyOrderCreated(orderId: string): Promise<void> {
  const fullOrder = await getOrderById(orderId);
  if (!fullOrder) {
    throw new Error("Order not found after creation");
  }

  await sendEmail.newOrder({ order: fullOrder });
  await sendEmail.receipt({ order: fullOrder });
}

/**
 * Clear cart after successful order creation.
 */
export async function clearCartAfterOrder(): Promise<void> {
  await clearCart();
}
