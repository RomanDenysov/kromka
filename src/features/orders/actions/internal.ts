import { parseISO } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import type {
  Address,
  PaymentMethod,
  ProductSnapshot,
  StoreSchedule,
} from "@/db/types";
import {
  clearB2bCart,
  clearCart,
  getB2bCart,
  getCart,
} from "@/features/cart/cookies";
import { userInfoSchema } from "@/features/checkout/schema";
import {
  filterTimeSlots,
  generateAllTimeSlots,
  getRestrictedPickupDates,
  isValidPickupDate,
} from "@/features/checkout/utils";
import { getResolverContext } from "@/features/recipes/api/queries";
import { resolveRecipeCost } from "@/features/recipes/lib/cost-resolver";
import { sendEmail } from "@/lib/email";
import { createOrderNumber, createPrefixedId } from "@/lib/ids";
import { log } from "@/lib/logger";
import { fail, guard, type StepResult, succeed } from "@/lib/pipeline";
import { getEffectivePrices } from "@/lib/pricing";
import { getTimeRangeForDate } from "@/lib/stores/schedule";
import { getOrderById } from "../api/queries";

export interface OrderItemData {
  price: number;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  /**
   * Computed cost-per-unit at order creation (Phase C). Nullable when
   * the product has no recipe or the resolver fails — never block
   * checkout to track cost.
   */
  unitCostCents: number | null;
}

export interface GuestCustomerInfo {
  email: string;
  name: string;
  phone: string;
}

export function validateGuestInfo(info: GuestCustomerInfo): StepResult<void> {
  const result = userInfoSchema.safeParse(info);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return fail(firstError?.message ?? "Neplatné údaje", "BAD_REQUEST");
  }
  return succeed(undefined);
}

/**
 * Server-side authority for the pickup slot. Mirrors what the client
 * date picker enforces: not past/today, daily cutoff for tomorrow,
 * max 30 days ahead, store open that day, category date restrictions,
 * and a valid time slot within the store's opening hours.
 */
export function validatePickupSlot({
  pickupDate,
  pickupTime,
  schedule,
  restrictedDates,
}: {
  pickupDate: string;
  pickupTime: string;
  restrictedDates: Set<string> | null;
  schedule: StoreSchedule | null;
}): StepResult<void> {
  const date = parseISO(pickupDate);
  if (
    Number.isNaN(date.getTime()) ||
    !isValidPickupDate(date, schedule, restrictedDates)
  ) {
    return fail("Neplatný dátum vyzdvihnutia", "BAD_REQUEST");
  }

  const timeRange = getTimeRangeForDate(date, schedule);
  if (!timeRange) {
    return fail("Predajňa je v tento deň zatvorená", "BAD_REQUEST");
  }

  const validSlots = filterTimeSlots(generateAllTimeSlots(), timeRange);
  if (!validSlots.includes(pickupTime)) {
    return fail("Neplatný čas vyzdvihnutia", "BAD_REQUEST");
  }

  return succeed(undefined);
}

/**
 * Category pickup-date restrictions for an existing order's items.
 * Used when the customer reschedules pickup.
 */
export async function getOrderPickupRestrictions(
  orderId: string
): Promise<Set<string> | null> {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
    columns: {},
    with: {
      product: {
        columns: {},
        with: { category: { columns: { pickupDates: true } } },
      },
    },
  });

  return getRestrictedPickupDates(
    items.map((item) => ({ category: item.product?.category }))
  );
}

/**
 * Build order items from cart with optional tier pricing.
 * Also returns category pickup-date restrictions for the cart so the
 * caller can validate the pickup slot server-side.
 */
export async function buildOrderItems(
  cartItems: Awaited<ReturnType<typeof getCart>>,
  priceTierId: string | null
): Promise<{
  items: OrderItemData[];
  restrictedPickupDates: Set<string> | null;
}> {
  const productIds = cartItems.map((item) => item.productId);
  const productData = await db.query.products.findMany({
    where: and(
      inArray(products.id, productIds),
      eq(products.isActive, true),
      eq(products.status, "active")
    ),
    with: {
      category: {
        columns: { isActive: true, name: true, pickupDates: true },
      },
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

  const productCosts = await computeProductCosts(activeProducts);

  const items = cartItems.flatMap((item) => {
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
        unitCostCents: productCosts.get(product.id) ?? null,
      },
    ];
  });

  return {
    items,
    restrictedPickupDates: getRestrictedPickupDates(activeProducts),
  };
}

/**
 * Resolve cost-per-unit for each product that has a recipe. Failures
 * are logged and the product gets null — checkout never breaks because
 * of cost tracking.
 */
async function computeProductCosts(
  activeProducts: Array<{ id: string; recipeId: string | null }>
): Promise<Map<string, number | null>> {
  const out = new Map<string, number | null>();
  const productsWithRecipe = activeProducts.filter((p) => p.recipeId);
  if (productsWithRecipe.length === 0) {
    return out;
  }

  try {
    const ctx = await getResolverContext({ includeDrafts: false });
    for (const p of productsWithRecipe) {
      if (!p.recipeId) {
        continue;
      }
      try {
        const resolved = resolveRecipeCost(p.recipeId, ctx);
        out.set(p.id, resolved.costPerUnitCents);
      } catch (err) {
        log.orders.warn(
          { err, productId: p.id, recipeId: p.recipeId },
          "Cost snapshot failed; storing null"
        );
        out.set(p.id, null);
      }
    }
  } catch (err) {
    log.orders.warn(
      { err },
      "Resolver context unavailable; all order items get null cost"
    );
  }

  return out;
}

/**
 * Validate that an active store exists; returns it with the opening
 * hours needed for pickup-slot validation.
 */
export async function validateStoreExists(
  storeId: string
): Promise<StepResult<{ id: string; openingHours: StoreSchedule | null }>> {
  const store = await db.query.stores.findFirst({
    where: and(eq(stores.id, storeId), eq(stores.isActive, true)),
    columns: { id: true, openingHours: true },
  });

  if (!store) {
    return fail("Vybraná predajňa neexistuje", "STORE_NOT_FOUND");
  }

  return succeed(store);
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
        sql`(${item.productId}::text, ${JSON.stringify(item.productSnapshot)}::jsonb, ${item.quantity}::integer, ${item.price}::integer, ${item.unitCostCents}::integer)`
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
          product_snapshot, quantity, price, unit_cost_cents
        )
        SELECT new_order.id, v.product_id, v.snapshot, v.qty, v.price, v.unit_cost
        FROM new_order, (VALUES ${sql.join(itemValues, sql`, `)}) AS v(product_id, snapshot, qty, price, unit_cost)
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
