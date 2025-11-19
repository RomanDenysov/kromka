import z from "zod";
import { MUTATIONS } from "@/db/mutations/stores";
import { QUERIES } from "@/db/queries/stores";
import { storeSchema } from "@/validation/stores";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminStoresRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure.query(async () => await QUERIES.ADMIN.GET_STORES()),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_STORE_BY_ID(input.id)),

  // ACTIONS
  createDraft: protectedProcedure.mutation(
    async () => await MUTATIONS.ADMIN.CREATE_DRAFT_STORE()
  ),
  copyStore: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.COPY_STORE(input.storeId)
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
  toggleIsActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.id)
    ),
});
