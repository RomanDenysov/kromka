import z from "zod";
import { QUERIES } from "@/db/queries/stores";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const adminStoresRouter = createTRPCRouter({
  // QUERIES
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_STORE_BY_ID(input.id)),
});

export const publicStoresRouter = createTRPCRouter({
  list: publicProcedure.query(async () => await QUERIES.PUBLIC.GET_STORES()),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(
      async ({ input }) => await QUERIES.PUBLIC.GET_STORE_BY_SLUG(input.slug)
    ),
});
