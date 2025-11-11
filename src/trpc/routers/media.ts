import z from "zod";
import { MUTATIONS } from "@/db/mutations/media";
import { QUERIES } from "@/db/queries/media";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminMediaRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => await QUERIES.ADMIN.GET_MEDIA()),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_MEDIA_BY_ID(input.id)),

  upload: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        path: z.string(),
        type: z.string(),
        size: z.number(),
      })
    )
    .mutation(
      async ({ input, ctx }) =>
        await MUTATIONS.ADMIN.UPLOAD_MEDIA(input, ctx.session.user.id)
    ),
});
