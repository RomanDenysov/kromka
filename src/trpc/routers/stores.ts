import z from "zod";
import { MUTATIONS } from "@/db/mutations/stores";
import { QUERIES } from "@/db/queries/stores";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminStoresRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => await QUERIES.ADMIN.GET_STORES()),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_STORE_BY_ID(input.id)),
  createDraft: protectedProcedure.mutation(
    async ({ ctx }) =>
      await MUTATIONS.ADMIN.CREATE_DRAFT_STORE(ctx.session.user.id)
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        store: z.object({
          name: z.string(),
          description: z.json(),
          isActive: z.boolean(),
          sortOrder: z.number(),
          phone: z.string(),
          email: z.string(),
          address: z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            zip: z.string(),
            country: z.string(),
            googleId: z.string(),
            postalCode: z.string(),
          }),
          imageId: z.string(),
          openingHours: z.object({
            weekdays: z.object({
              open: z.string(),
              close: z.string(),
            }),
            saturday: z.object({
              open: z.string(),
              close: z.string(),
            }),
            sunday: z.object({
              open: z.string(),
              close: z.string(),
            }),
          }),
        }),
      })
    )
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_STORE(input.id, input.store)
    ),
});
