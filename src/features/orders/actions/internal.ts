"use server";

import { isBefore, isSameDay, startOfToday } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { fail, guard, succeed, type StepResult } from "@/lib/pipeline";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import type { Address, PaymentMethod } from "@/db/types";
import { clearCart, getCart } from "@/features/cart/cookies";
import { sendEmail } from "@/lib/email";
import { log } from "@/lib/logger";
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

/** Duplicate order detection window (5 minutes) */
export const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateGuestInfo(
  info: GuestCustomerInfo
): Promise<StepResult<void>> {
  if (!info.name.trim()) return fail("Meno je povinné", "INVALID_NAME");
  if (!info.email.trim() || !EMAIL_REGEX.test(info.email))
    return fail("Neplatný email", "INVALID_EMAIL");
  if (!info.phone.trim()) return fail("Neplatné telefónne číslo", "INVALID_PHONE");
  return succeed(undefined);
}

export async function validatePickupDate(dateStr: string): Promise<StepResult<void>> {
  const pickupDate = new Date(dateStr);
  const today = startOfToday();
  if (
    Number.isNaN(pickupDate.getTime()) ||
    isBefore(pickupDate, today) ||
    isSameDay(pickupDate, today)
  ) {
    return fail("Neplatný dátum vyzdvihnutia", "BAD_REQUEST");
  }
  return succeed(undefined);
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
    where: and(
      inArray(products.id, productIds),
      eq(products.isActive, true),
      eq(products.status, "active")
    ),
  });

  // Verify all requested products were found and active
  const foundIds = new Set(productData.map((p) => p.id));
  const missingIds = productIds.filter((id) => !foundIds.has(id));
  guard(
    missingIds.length === 0,
    `Niektoré produkty nie sú dostupné: ${missingIds.join(", ")}`,
    "INVALID_PRODUCTS"
  );

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
export async function validateStoreExists(
  storeId: string
): Promise<StepResult<void>> {
  const storeExists = await db.query.stores.findFirst({
    where: and(eq(stores.id, storeId), eq(stores.isActive, true)),
    columns: { id: true },
  });

  if (!storeExists) {
    return fail("Vybraná predajňa neexistuje", "STORE_NOT_FOUND");
  }

  return succeed(undefined);
}

/**
 * Validate that cart is not empty.
 */
export async function validateCart(): Promise<
  StepResult<Awaited<ReturnType<typeof getCart>>>
> {
  const cartItems = await getCart();
  if (cartItems.length === 0) {
    return fail("Košík je prázdny", "EMPTY_CART");
  }

  return succeed(cartItems);
}

type PersistOrderParams = {
  userId: string | null;
  customerInfo: GuestCustomerInfo;
  storeId: string | null;
  companyId: string | null;
  paymentMethod: PaymentMethod;
  pickupDate: string;
  pickupTime: string;
  totalCents: number;
  orderItemsData: OrderItemData[];
  deliveryAddress?: Address | null;
};

/**
 * Persist order to database: create order, items, and status event.
 */
export async function persistOrder(params: PersistOrderParams): Promise<{
  orderId: string;
  orderNumber: string;
}> {
  guard(
    params.orderItemsData.length > 0,
    "Nie je možné vytvoriť objednávku bez položiek",
    "INVALID_PRODUCTS"
  );

  const orderNumber = createPrefixedNumericId("OBJ");

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      createdBy: params.userId,
      customerInfo: params.customerInfo,
      storeId: params.storeId,
      companyId: params.companyId,
      deliveryAddress: params.deliveryAddress ?? null,
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
    log.orders.error({ orderId }, "Order not found for notification after creation");
    return;
  }

  // Send emails independently — one failure shouldn't block the other
  await Promise.allSettled([
    sendEmail.newOrder({ order: fullOrder }),
    sendEmail.receipt({ order: fullOrder }),
  ]);
}

/**
 * Clear cart after successful order creation.
 */
export async function clearCartAfterOrder(): Promise<void> {
  await clearCart();
}

/**
 * Clear B2B cart after successful order creation.
 */
export async function clearB2bCartAfterOrder(): Promise<void> {
  const { clearB2bCart } = await import("@/features/cart/cookies");
  await clearB2bCart();
}

/**
 * Validate that B2B cart is not empty.
 */
export async function validateB2bCart(): Promise<
  StepResult<Awaited<ReturnType<typeof getCart>>>
> {
  const { getB2bCart } = await import("@/features/cart/cookies");
  const cartItems = await getB2bCart();
  if (cartItems.length === 0) {
    return fail("B2B košík je prázdny", "EMPTY_CART");
  }
  return succeed(cartItems);
}
