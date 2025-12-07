"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  carts,
  orderItems,
  orderStatusEvents,
  orders,
  organizations,
  prices,
  products,
} from "@/db/schema";
import type { OrderStatus, PaymentMethod } from "@/db/types";
import { getAuth } from "../auth/session";
import { createPrefixedNumericId } from "../ids";

/**
 * Get the price for a product based on company's price tier and quantity
 */
export async function getProductPrice(
  productId: string,
  companyId: string | null,
  _quantity: number
): Promise<number> {
  if (!companyId) {
    // B2C: use product's default price
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { priceCents: true },
    });
    return product?.priceCents ?? 0;
  }

  // B2B: get organization's price tier
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, companyId),
    columns: { priceTierId: true },
    with: {
      priceTier: true,
    },
  });

  if (!org?.priceTierId) {
    // No price tier: fallback to default price
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { priceCents: true },
    });
    return product?.priceCents ?? 0;
  }

  // Find the best matching price tier (highest minQty <= quantity)
  const price = await db.query.prices.findFirst({
    where: and(
      eq(prices.productId, productId),
      eq(prices.priceTierId, org.priceTierId)
    ),
    columns: { priceCents: true },
  });
  return price?.priceCents ?? 0;
}

type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

/**
 * Create order from cart (B2C checkout)
 */
export async function createOrderFromCart(data: {
  storeId: string;
  pickupDate: Date;
  pickupTime: string;
  paymentMethod: PaymentMethod;
}): Promise<CreateOrderResult> {
  try {
    const { user, session } = await getAuth();
    if (!(user && session)) {
      return { success: false, error: "Unauthorized" };
    }

    const companyId = session.session?.activeOrganizationId ?? null;
    const isB2B = companyId !== null;

    // 1. Get cart
    const cart = await db.query.carts.findFirst({
      where: (cartTable, { eq: eqFn, and: andFn, isNull }) =>
        companyId
          ? andFn(
              eqFn(cartTable.userId, user.id),
              eqFn(cartTable.companyId, companyId)
            )
          : andFn(eqFn(cartTable.userId, user.id), isNull(cartTable.companyId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Košík je prázdny" };
    }

    // 2. Validation of items
    const validItems = cart.items.filter((item) => item.product);
    if (validItems.length === 0) {
      return { success: false, error: "Žiadne platné produkty v košíku" };
    }

    // 3. Preparation of items with prices
    const orderItemsData = await Promise.all(
      validItems.map(async (item) => {
        // biome-ignore lint/style/noNonNullAssertion: TODO: fix this in a future
        const product = item.product!;
        const priceCents = isB2B
          ? await getProductPrice(item.productId, companyId, item.quantity)
          : product.priceCents;

        return {
          productId: item.productId,
          productSnapshot: {
            name: product.name,
            price: priceCents,
          },
          price: priceCents,
          quantity: item.quantity,
        };
      })
    );

    // 4. Розрахунок total
    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 5. Generation of order number
    const orderNumber = createPrefixedNumericId("OBJ");

    // 6. Creation of order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        createdBy: user.id,
        storeId: data.storeId,
        companyId,
        orderStatus: "new",
        paymentStatus: "pending",
        paymentMethod: isB2B ? "invoice" : data.paymentMethod,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        totalCents,
      })
      .returning();

    // 7. Batch insert items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }))
    );

    // 8. Status event
    await db.insert(orderStatusEvents).values({
      orderId: order.id,
      status: "new",
      createdBy: user.id,
    });

    // 9. Deletion of cart
    await db.delete(carts).where(eq(carts.id, cart.id));

    return {
      success: true,
      orderId: order.id,
      orderNumber,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: TODO: replace with error logging later
    console.error("Create order failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri vytváraní objednávky",
    };
  }
}

export async function createB2BOrderFromCart(data: {
  storeId: string;
  pickupDate: Date;
  pickupTime: string;
}) {
  const { session } = await getAuth();
  if (!session?.session?.activeOrganizationId) {
    throw new Error("Not a B2B user");
  }

  return createOrderFromCart({
    ...data,
    paymentMethod: "invoice",
  });
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatusAction({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  note?: string;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({ orderStatus: status })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusEvents).values({
    orderId,
    status,
    createdBy: user.id,
    note: note ?? null,
  });

  return updatedOrder;
}
