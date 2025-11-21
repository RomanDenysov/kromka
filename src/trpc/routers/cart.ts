import z from "zod";
import { MUTATIONS } from "@/db/mutations/orders";
import { QUERIES } from "@/db/queries/orders";
import { createTRPCRouter, sessionProcedure } from "../init";

export const publicCartRouter = createTRPCRouter({
  getCart: sessionProcedure.query(
    async ({ ctx }) => await QUERIES.PUBLIC.GET_CART(ctx.session.user.id)
  ),
  addToCart: sessionProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await MUTATIONS.PUBLIC.ADD_TO_CART(
        input.productId,
        ctx.session.user.id,
        input.quantity
      );
    }),
  removeFromCart: sessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await MUTATIONS.PUBLIC.REMOVE_FROM_CART(
        input.productId,
        ctx.session.user.id
      );
    }),
  updateQuantity: sessionProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await MUTATIONS.PUBLIC.UPDATE_CART_ITEM_QUANTITY(
        input.productId,
        ctx.session.user.id,
        input.quantity
      );
    }),
});
