import z from "zod";
import { MUTATIONS } from "@/db/mutations/product-channels";
import { QUERIES } from "@/db/queries/product-channels";
import {
  outputProductChannelSchema,
  productChannelSchema,
} from "@/validation/product-channels";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminProductChannelsRouter = createTRPCRouter({
  // QUERIES
  byProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .output(z.array(outputProductChannelSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRODUCT_CHANNELS(input.productId)
    ),

  byChannel: protectedProcedure
    .input(z.object({ channel: productChannelSchema.shape.channel }))
    .output(z.array(outputProductChannelSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_CHANNEL_PRODUCTS(input.channel)
    ),

  // MUTATIONS
  create: protectedProcedure
    .input(
      z.object({
        channel: productChannelSchema,
      })
    )
    .output(outputProductChannelSchema)
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.CREATE_PRODUCT_CHANNEL(input.channel)
    ),

  update: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        channel: productChannelSchema.shape.channel,
        updates: productChannelSchema
          .omit({ productId: true, channel: true })
          .partial(),
      })
    )
    .output(outputProductChannelSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_PRODUCT_CHANNEL(
          input.productId,
          input.channel,
          input.updates
        )
    ),

  toggleIsListed: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        channel: productChannelSchema.shape.channel,
      })
    )
    .output(outputProductChannelSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.TOGGLE_IS_LISTED(input.productId, input.channel)
    ),

  delete: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        channel: productChannelSchema.shape.channel,
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.DELETE_PRODUCT_CHANNEL(
          input.productId,
          input.channel
        )
    ),
});
