import z from "zod";
import { QUERIES } from "@/db/queries/product-channels";
import {
  outputProductChannelSchema,
  productChannelSchema,
} from "@/validation/product-channels";
import { createTRPCRouter, publicProcedure } from "../../init";

export const publicProductChannelsRouter = createTRPCRouter({
  // QUERIES
  byChannel: publicProcedure
    .input(z.object({ channel: productChannelSchema.shape.channel }))
    .output(z.array(outputProductChannelSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_CHANNEL_PRODUCTS(input.channel)
    ),
});
