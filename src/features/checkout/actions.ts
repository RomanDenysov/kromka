"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { GuestCustomerInfo } from "@/features/orders/actions";
import { getLastOrderId, setLastOrderId } from "./cookies";

/**
 * Last order prefill data for checkout form
 * Contains customer info and store ID from the most recent order
 */
export type LastOrderPrefill = {
  customerInfo: GuestCustomerInfo | null;
  storeId: string | null;
};

/**
 * Get the last order prefill data for checkout form
 * For authenticated users: queries by userId
 * For guests: reads from krmk-last-order cookie
 * Returns customerInfo and storeId from the most recent order
 */
export async function getLastOrderPrefillAction(
  userId?: string
): Promise<LastOrderPrefill | null> {
  try {
    let lastOrder:
      | {
          customerInfo: {
            name?: string | null;
            email: string;
            phone: string;
          } | null;
          storeId: string | null;
        }
      | undefined;

    if (userId) {
      // Authenticated user: query by userId
      lastOrder = await db.query.orders.findFirst({
        where: eq(orders.createdBy, userId),
        orderBy: [desc(orders.createdAt)],
        columns: {
          customerInfo: true,
          storeId: true,
        },
      });
    } else {
      // Guest: read from cookie
      const lastOrderId = await getLastOrderId();
      if (!lastOrderId) {
        return null;
      }

      lastOrder = await db.query.orders.findFirst({
        where: eq(orders.id, lastOrderId),
        columns: {
          customerInfo: true,
          storeId: true,
        },
      });
    }

    if (!lastOrder) {
      return null;
    }

    const customerInfo = lastOrder.customerInfo;
    const hasValidCustomerInfo =
      customerInfo &&
      typeof customerInfo.email === "string" &&
      typeof customerInfo.phone === "string";

    return {
      customerInfo: hasValidCustomerInfo
        ? {
            name: customerInfo.name ?? "",
            email: customerInfo.email,
            phone: customerInfo.phone,
          }
        : null,
      storeId: lastOrder.storeId ?? null,
    };
  } catch (error) {
    console.error("Failed to get last order prefill:", error);
    return null;
  }
}

/**
 * Set the last order ID in cookie (for guests)
 * Called after successful order creation
 */
export async function setLastOrderIdAction(orderId: string): Promise<void> {
  try {
    await setLastOrderId(orderId);
  } catch (error) {
    console.error("Failed to set last order ID:", error);
  }
}

/**
 * Get the most recent order with all item details for "repeat order" feature
 * For authenticated users: queries by userId
 * For guests: reads from krmk-last-order cookie
 * Returns items with current product prices, filtering out deleted/unavailable products
 */
export async function getLastOrderWithItemsAction(userId?: string) {
  try {
    let lastOrder: Awaited<
      ReturnType<
        typeof db.query.orders.findFirst<{
          with: {
            items: {
              with: {
                product: {
                  columns: {
                    id: true;
                    name: true;
                    slug: true;
                    priceCents: true;
                    status: true;
                  };
                  with: {
                    image: {
                      columns: {
                        url: true;
                      };
                    };
                  };
                };
              };
            };
          };
        }>
      >
    >;

    if (userId) {
      // Authenticated user: query by userId
      lastOrder = await db.query.orders.findFirst({
        where: eq(orders.createdBy, userId),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  priceCents: true,
                  status: true,
                },
                with: {
                  image: {
                    columns: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // Guest: read from cookie
      const lastOrderId = await getLastOrderId();
      if (!lastOrderId) {
        return null;
      }

      lastOrder = await db.query.orders.findFirst({
        where: eq(orders.id, lastOrderId),
        with: {
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  priceCents: true,
                  status: true,
                },
                with: {
                  image: {
                    columns: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!lastOrder?.items || lastOrder.items.length === 0) {
      return null;
    }

    // Filter out unavailable products (draft status means not yet published)
    const availableItems = lastOrder.items.filter(
      (item) => item.product && item.product.status !== "draft"
    );

    if (availableItems.length === 0) {
      return null;
    }

    return {
      orderId: lastOrder.id,
      items: availableItems
        .map((item) => {
          const product = item.product;
          if (!product) {
            return null;
          }
          return {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            priceCents: product.priceCents,
            imageUrl: product.image?.url ?? null,
            quantity: item.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    };
  } catch (error) {
    console.error("Failed to get last order with items:", error);
    return null;
  }
}
