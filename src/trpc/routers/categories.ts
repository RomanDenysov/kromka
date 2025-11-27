import z from "zod";
import { MUTATIONS } from "@/db/mutations/categories";
import { QUERIES } from "@/db/queries/categories";
import { updateCategorySchema } from "@/validation/categories";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const adminCategoriesRouter = createTRPCRouter({
  list: protectedProcedure.query(
    async () => await QUERIES.ADMIN.GET_CATEGORIES()
  ),
  toggleFeatured: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.TOGGLE_FEATURED(input.categoryId)
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
  createDraft: protectedProcedure.mutation(
    async ({ ctx }) =>
      await MUTATIONS.ADMIN.CREATE_DRAFT_CATEGORY(ctx.session.user.id)
  ),
  copyCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.COPY_CATEGORY(input.categoryId)
    ),
  update: protectedProcedure
    .input(z.object({ id: z.string(), category: updateCategorySchema }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_CATEGORY(input.id, input.category)
    ),
  toggleActive: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.ids)
    ),
  delete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.DELETE_CATEGORIES(input.ids)
    ),
});

export const publicCategoriesRouter = createTRPCRouter({
  list: publicProcedure.query(
    async () => await QUERIES.PUBLIC.GET_CATEGORIES()
  ),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(
      async ({ input }) => await QUERIES.PUBLIC.GET_CATEGORY_BY_SLUG(input.slug)
    ),
  featured: publicProcedure.query(
    async () => await QUERIES.PUBLIC.GET_FEATURED_CATEGORIES()
  ),
});
