import z from "zod";
import { MUTATIONS } from "@/db/mutations/media";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminMediaRouter = createTRPCRouter({
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
    .mutation(async ({ input }) => await MUTATIONS.ADMIN.UPLOAD_MEDIA(input)),
});
