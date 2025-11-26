import z from "zod";
import { MUTATIONS } from "@/db/mutations/stores";
import { QUERIES } from "@/db/queries/stores";
import { storeSchema } from "@/validation/stores";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

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
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.ids)
    ),
  deleteStore: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.DELETE_STORE(input.ids)
    ),
});

export const publicStoresRouter = createTRPCRouter({
  list: publicProcedure.query(async () => await QUERIES.PUBLIC.GET_STORES()),
  setUserStore: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .mutation(
      async ({ ctx, input }) =>
        await MUTATIONS.PUBLIC.SET_USER_STORE(
          input.storeId,
          ctx.session.user.id
        )
    ),
  getUserStore: protectedProcedure.query(
    async ({ ctx }) => await QUERIES.PUBLIC.GET_USER_STORE(ctx.session.user.id)
  ),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(
      async ({ input }) => await QUERIES.PUBLIC.GET_STORE_BY_SLUG(input.slug)
    ),
});
