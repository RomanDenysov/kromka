import z from "zod";
import { QUERIES } from "@/db/queries/organizations";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminOrganizationsRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure.query(
    async () => await QUERIES.ADMIN.GET_ORGANIZATIONS()
  ),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_ORGANIZATION_BY_ID(input.id)
    ),

  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_ORGANIZATION_BY_SLUG(input.slug)
    ),
});
