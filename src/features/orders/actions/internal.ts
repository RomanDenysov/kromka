import { isBefore, isSameDay, startOfToday } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import type { Address, PaymentMethod, ProductSnapshot } from "@/db/types";
import {
  clearB2bCart,
  clearCart,
  getB2bCart,
  getCart,
} from "@/features/cart/cookies";
import { sendEmail } from "@/lib/email";
import { createOrderNumber, createPrefixedId } from "@/lib/ids";
import { log } from "@/lib/logger";
import { fail, guard, type StepResult, succeed } from "@/lib/pipeline";
import { getEffectivePrices } from "@/lib/pricing";
import { getOrderById } from "../api/queries";

export interface OrderItemData {
  price: number;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
}

export interface GuestCustomerInfo {
  email: string;
  name: string;
  phone: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateGuestInfo(info: GuestCustomerInfo): StepResult<void> {
  if (!info.name.trim()) {
    return fail("Meno je povinné", "INVALID_NAME");
  }
  if (!(info.email.trim() && EMAIL_REGEX.test(info.email))) {
    return fail("Neplatný email", "INVALID_EMAIL");
  }
  if (!info.phone.trim()) {
    return fail("Neplatné telefónne číslo", "INVALID_PHONE");
  }
  return succeed(undefined);
}

export function validatePickupDate(dateStr: string): StepResult<void> {
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
    with: {
      category: { columns: { isActive: true, name: true } },
    },
  });

  // Filter out products in inactive categories
  const activeProducts = productData.filter(
    (p) => p.category?.isActive !== false
  );

  // Verify all requested products were found and active (including category)
  const foundIds = new Set(activeProducts.map((p) => p.id));
  const missingIds = productIds.filter((id) => !foundIds.has(id));

  if (missingIds.length > 0) {
    log.orders.warn({ missingIds }, "Products unavailable during order build");
  }
  guard(
    missingIds.length === 0,
    `${missingIds.length} produkty v košíku nie sú dostupné. Obnovte stránku.`,
    "INVALID_PRODUCTS"
  );

  const productPrices = activeProducts.map((p) => ({
    productId: p.id,
    basePriceCents: p.priceCents,
  }));
  const effectivePrices =
    priceTierId && productPrices.length > 0
      ? await getEffectivePrices({ productPrices, priceTierId })
      : new Map<string, number>();

  return cartItems.flatMap((item) => {
    const product = activeProducts.find((p) => p.id === item.productId);
    if (!product) {
      return [];
    }

    const effectivePrice =
      effectivePrices.get(product.id) ?? product.priceCents;

    return [
      {
        productId: item.productId,
        productSnapshot: {
          name: product.name,
          price: effectivePrice,
          categoryName: product.category?.name ?? null,
          basePriceCents: product.priceCents,
          effectivePriceCents: effectivePrice,
        },
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

interface PersistOrderParams {
  companyId: string | null;
  customerInfo: GuestCustomerInfo;
  deliveryAddress?: Address | null;
  orderItemsData: OrderItemData[];
  paymentMethod: PaymentMethod;
  pickupDate: string;
  pickupTime: string;
  storeId: string | null;
  totalCents: number;
  userId: string | null;
}

const MAX_PERSIST_ATTEMPTS = 2;

/**
 * Persist order to database atomically via CTE.
 * Creates order, items, and initial status event in a single SQL statement.
 * Retries once on order number collision (unique constraint violation).
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

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_PERSIST_ATTEMPTS; attempt++) {
    const orderId = createPrefixedId("ord");
    const orderNumber = createOrderNumber("OBJ");
    const eventId = createPrefixedId("ose");

    const itemValues = params.orderItemsData.map(
      (item) =>
        sql`(${item.productId}::text, ${JSON.stringify(item.productSnapshot)}::jsonb, ${item.quantity}::integer, ${item.price}::integer)`
    );

    const query = sql`
      WITH new_order AS (
        INSERT INTO ${orders} (
          id, order_number, created_by,
          customer_info, store_id, company_id,
          delivery_address, order_status, payment_status,
          payment_method, total_cents, pickup_date,
          pickup_time
        )
        VALUES (
          ${orderId}, ${orderNumber}, ${params.userId},
          ${JSON.stringify(params.customerInfo)}::jsonb, ${params.storeId}, ${params.companyId},
          ${params.deliveryAddress ? JSON.stringify(params.deliveryAddress) : null}::jsonb,
          'new', 'pending', ${params.paymentMethod}, ${params.totalCents},
          ${params.pickupDate}::date, ${params.pickupTime}
        )
        RETURNING id, order_number
      ),
      new_items AS (
        INSERT INTO ${orderItems} (
          order_id, product_id,
          product_snapshot, quantity, price
        )
        SELECT new_order.id, v.product_id, v.snapshot, v.qty, v.price
        FROM new_order, (VALUES ${sql.join(itemValues, sql`, `)}) AS v(product_id, snapshot, qty, price)
        RETURNING 1
      ),
      new_event AS (
        INSERT INTO ${orderStatusEvents} (
          id, order_id,
          status, created_by
        )
        SELECT ${eventId}, new_order.id, 'new', ${params.userId}
        FROM new_order
        RETURNING 1
      )
      SELECT 1 FROM new_order
    `;

    try {
      await db.execute(query);
      return { orderId, orderNumber };
    } catch (error) {
      lastError = error;
      const errorCode =
        error instanceof Error && "code" in error
          ? (error as { code: string }).code
          : undefined;
      const isCollision =
        errorCode === "23505" && attempt < MAX_PERSIST_ATTEMPTS - 1;

      if (!isCollision) {
        log.orders.error(
          { err: error, code: errorCode, orderId, orderNumber },
          "Database error persisting order"
        );
        throw error;
      }

      log.orders.warn(
        {
          orderNumber,
          attempt: attempt + 1,
          maxAttempts: MAX_PERSIST_ATTEMPTS,
        },
        "Order number collision, retrying with new ID"
      );
    }
  }

  throw lastError ?? new Error("Failed to persist order after retries");
}

/**
 * Send order creation notifications (new order email to staff, receipt to customer).
 */
export async function notifyOrderCreated(orderId: string): Promise<void> {
  const fullOrder = await getOrderById(orderId);
  if (!fullOrder) {
    throw new Error(
      `Order ${orderId} not found after creation - data consistency issue`
    );
  }

  const results = await Promise.allSettled([
    sendEmail.newOrder({ order: fullOrder }),
    sendEmail.receipt({ order: fullOrder }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      log.email.error(
        { err: result.reason, orderId },
        "Failed to send order notification email"
      );
    }
  }
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
  await clearB2bCart();
}

/**
 * Validate that B2B cart is not empty.
 */
export async function validateB2bCart(): Promise<
  StepResult<Awaited<ReturnType<typeof getCart>>>
> {
  const cartItems = await getB2bCart();
  if (cartItems.length === 0) {
    return fail("B2B košík je prázdny", "EMPTY_CART");
  }
  return succeed(cartItems);
}
