import z from "zod";
import { MUTATIONS } from "@/db/mutations/stores";
import { QUERIES } from "@/db/queries/stores";
import { storeSchema } from "@/validation/stores";
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
        store: storeSchema,
      })
    )
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_STORE(input.id, input.store)
    ),
});
