import z from "zod";
import { MUTATIONS } from "@/db/mutations/prices";
import { QUERIES } from "@/db/queries/prices";
import { priceSchema, priceWithRelationsSchema } from "@/validation/prices";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminPricesRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure
    .input(
      z
        .object({
          productId: z.string().optional(),
          channel: priceSchema.shape.channel.optional(),
          orgId: z.string().nullable().optional(),
        })
        .optional()
    )
    .output(z.array(priceWithRelationsSchema))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_PRICES(input)),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(priceWithRelationsSchema.nullable())
    .query(
      async ({ input }) =>
        (await QUERIES.ADMIN.GET_PRICE_BY_ID(input.id)) ?? null
    ),

  byProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .output(z.array(priceWithRelationsSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRICES_BY_PRODUCT(input.productId)
    ),

  // MUTATIONS
  create: protectedProcedure
    .input(
      z.object({
        price: priceSchema.omit({ id: true }),
      })
    )
    .output(priceSchema)
    .mutation(
      async ({ input, ctx }) =>
        await MUTATIONS.ADMIN.CREATE_PRICE(ctx.session.user.id, input.price)
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        price: priceSchema.omit({ id: true }).partial(),
      })
    )
    .output(priceSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_PRICE(input.id, input.price)
    ),

  toggleIsActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(priceSchema.nullable())
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.id)
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.DELETE_PRICE(input.id)
    ),
});
