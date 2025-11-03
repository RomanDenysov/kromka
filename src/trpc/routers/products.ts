import z from "zod";
import { MUTATIONS } from "@/db/mutations/products";
import { QUERIES } from "@/db/queries/products";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminProductsRouter = createTRPCRouter({
  // QUERIES
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
  // ACTIONS
  createDraft: protectedProcedure.mutation(
    async () => await MUTATIONS.ADMIN.CREATE_DRAFT_PRODUCT()
  ),
  // update: protectedProcedure.input(z.object({ id: z.string(), product: createProductSchema })).mutation(
  //   async ({ input }) => await MUTATIONS.ADMIN.UPDATE_PRODUCT(input.id, input.product)
  // ),
  toggleIsActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.id)
    ),
});
