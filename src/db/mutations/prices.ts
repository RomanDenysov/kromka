import "server-only";

import { eq, not } from "drizzle-orm";
import { db } from "@/db";
import type { PriceSchema } from "@/validation/prices";
import { prices } from "../schema";

export const MUTATIONS = {
  ADMIN: {
    CREATE_PRICE: async (userId: string, price: Omit<PriceSchema, "id">) => {
      const [newPrice] = await db
        .insert(prices)
        .values({
          ...price,
          createdBy: userId,
        })
        .returning();

      return newPrice;
    },

    UPDATE_PRICE: async (
      priceId: string,
      price: Partial<Omit<PriceSchema, "id">>
    ) => {
      const [updatedPrice] = await db
        .update(prices)
        .set(price)
        .where(eq(prices.id, priceId))
        .returning();

      return updatedPrice;
    },

    TOGGLE_IS_ACTIVE: async (priceId: string) => {
      const [updatedPrice] = await db
        .update(prices)
        .set({ isActive: not(prices.isActive) })
        .where(eq(prices.id, priceId))
        .returning();

      return updatedPrice;
    },

    DELETE_PRICE: async (priceId: string) => {
      await db.delete(prices).where(eq(prices.id, priceId));
      return { success: true };
    },
  },
};
