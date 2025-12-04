import z from "zod";
import { QUERIES } from "@/db/queries/categories";
import { createTRPCRouter, publicProcedure } from "../init";

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
