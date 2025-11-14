import z from "zod";
import { QUERIES } from "@/db/queries/prices";
import { priceWithRelationsSchema } from "@/validation/prices";
import { createTRPCRouter, publicProcedure } from "../../init";

export const publicPricesRouter = createTRPCRouter({
  // QUERIES
  byProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .output(z.array(priceWithRelationsSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRICES_BY_PRODUCT(input.productId)
    ),
});
