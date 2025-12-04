import z from "zod";
import { QUERIES } from "@/db/queries/products";
import { createTRPCRouter, publicProcedure } from "../init";

export const publicProductsRouter = createTRPCRouter({
  infinite: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
        categoryId: z.string().optional(),
      })
    )
    .query(
      async ({ input }) => await QUERIES.PUBLIC.GET_PRODUCTS_INFINITE(input)
    ),
});
