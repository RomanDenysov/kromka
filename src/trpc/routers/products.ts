import z from "zod";
import { QUERIES } from "@/db/queries/products";
import { outputProductSchema } from "@/validation/products";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const adminProductsRouter = createTRPCRouter({
  // QUERIES
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(outputProductSchema.nullable())
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_PRODUCT_BY_ID(input.id)
    ),
  byCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .output(z.array(outputProductSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRODUCTS_BY_CATEGORY(input.categoryId)
    ),
  images: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRODUCT_IMAGES(input.productId)
    ),
});

export const publicProductsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => await QUERIES.PUBLIC.GET_PRODUCTS()),
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
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(
      async ({ input }) => await QUERIES.PUBLIC.GET_PRODUCT_BY_SLUG(input.slug)
    ),
});
