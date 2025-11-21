import { MUTATIONS } from "@/db/mutations/orders";
import { createTRPCRouter, publicProcedure } from "../init";

export const publicCartRouter = createTRPCRouter({
  addToCart: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await MUTATIONS.PUBLIC.ADD_TO_CART(input.id);
    }),
});
