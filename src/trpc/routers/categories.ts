import z from "zod";
import { QUERIES } from "@/db/queries/categories";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminCategoriesRouter = createTRPCRouter({
  list: protectedProcedure.query(
    async () => await QUERIES.ADMIN.GET_CATEGORIES()
  ),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_CATEGORY_BY_ID(input.id)
    ),
  byProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_CATEGORIES_BY_PRODUCT(input.productId)
    ),
});
