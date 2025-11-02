import z from "zod";
import { QUERIES } from "@/db/queries/products";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminProductsRouter = createTRPCRouter({
  list: protectedProcedure.query(
    async () => await QUERIES.ADMIN.GET_PRODUCTS()
  ),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_PRODUCT_BY_ID(input.id)
    ),
  byCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRODUCTS_BY_CATEGORY(input.categoryId)
    ),
});
