import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import type { DeliverySchema } from "@/validation/deliveries";
import { deliveries } from "../schema";

export const MUTATIONS = {
  ADMIN: {
    CREATE_DELIVERY: async (delivery: Omit<DeliverySchema, "id">) => {
      const [newDelivery] = await db
        .insert(deliveries)
        .values(delivery)
        .returning();

      return newDelivery;
    },

    UPDATE_DELIVERY: async (
      deliveryId: string,
      delivery: Partial<Omit<DeliverySchema, "id" | "orderId">>
    ) => {
      const [updatedDelivery] = await db
        .update(deliveries)
        .set(delivery)
        .where(eq(deliveries.id, deliveryId))
        .returning();

      return updatedDelivery;
    },

    UPDATE_DELIVERY_STATUS: async (
      deliveryId: string,
      status: DeliverySchema["status"],
      additionalFields?: Partial<Omit<DeliverySchema, "id" | "orderId">>
    ) => {
      const [updatedDelivery] = await db
        .update(deliveries)
        .set({
          status,
          ...additionalFields,
        })
        .where(eq(deliveries.id, deliveryId))
        .returning();

      return updatedDelivery;
    },
  },
};
