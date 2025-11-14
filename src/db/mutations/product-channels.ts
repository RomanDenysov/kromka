import "server-only";

import { and, eq, not } from "drizzle-orm";
import { db } from "@/db";
import type { ProductChannelSchema } from "@/validation/product-channels";
import { productChannels } from "../schema";

export const MUTATIONS = {
  ADMIN: {
    CREATE_PRODUCT_CHANNEL: async (channel: ProductChannelSchema) => {
      const [newChannel] = await db
        .insert(productChannels)
        .values(channel)
        .returning();

      return newChannel;
    },

    UPDATE_PRODUCT_CHANNEL: async (
      productId: string,
      channel: ProductChannelSchema["channel"],
      updates: Partial<Omit<ProductChannelSchema, "productId" | "channel">>
    ) => {
      const [updatedChannel] = await db
        .update(productChannels)
        .set(updates)
        .where(
          and(
            eq(productChannels.productId, productId),
            eq(productChannels.channel, channel)
          )
        )
        .returning();

      return updatedChannel;
    },

    TOGGLE_IS_LISTED: async (
      productId: string,
      channel: ProductChannelSchema["channel"]
    ) => {
      const [updatedChannel] = await db
        .update(productChannels)
        .set({ isListed: not(productChannels.isListed) })
        .where(
          and(
            eq(productChannels.productId, productId),
            eq(productChannels.channel, channel)
          )
        )
        .returning();

      return updatedChannel;
    },

    DELETE_PRODUCT_CHANNEL: async (
      productId: string,
      channel: ProductChannelSchema["channel"]
    ) => {
      await db
        .delete(productChannels)
        .where(
          and(
            eq(productChannels.productId, productId),
            eq(productChannels.channel, channel)
          )
        );

      return { success: true };
    },
  },
};
