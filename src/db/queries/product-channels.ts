import "server-only";
import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCT_CHANNELS: async (productId: string) =>
      await db.query.productChannels.findMany({
        where: (channel, { eq: eqFn }) => eqFn(channel.productId, productId),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      }),

    GET_CHANNEL_PRODUCTS: async (channel: "B2C" | "B2B") =>
      await db.query.productChannels.findMany({
        where: (pc, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(pc.channel, channel), eqFn(pc.isListed, true)),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              isActive: true,
            },
          },
        },
      }),
  },
};
