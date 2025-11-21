import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "../schema/orders";
import { products } from "../schema/products";

export const MUTATIONS = {
  PUBLIC: {
    ADD_TO_CART: async (
      productId: string,
      userId: string,
      quantity: number
    ) => {
      let orderId: string | undefined;

      orderId = (
        await db.query.orders.findFirst({
          where: and(
            eq(orders.orderStatus, "cart"),
            eq(orders.createdBy, userId)
          ),
          columns: {
            id: true,
          },
        })
      )?.id;
      if (!orderId) {
        orderId = (
          await db
            .insert(orders)
            .values({
              orderStatus: "cart",
              createdBy: userId,
            })
            .returning({ id: orders.id })
        )[0].id;
      }

      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      });
      if (!product) {
        throw new Error("Product not found");
      }
      await db
        .insert(orderItems)
        .values({
          orderId,
          productId,
          productSnapshot: {
            name: product.name,
            price: product.priceCents,
          },
          price: product.priceCents,
          quantity,
        })
        .onConflictDoUpdate({
          target: [orderItems.orderId, orderItems.productId],
          set: {
            quantity: sql`excluded.quantity + ${quantity}`,
            price: sql`excluded.price`,
            total: sql`excluded.price * (excluded.quantity + ${quantity})`,
          },
        });
    },
  },
};
