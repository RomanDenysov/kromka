import { z } from "zod";
import { QUERIES } from "@/db/queries/users";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const adminUsersRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => await QUERIES.ADMIN.GET_USERS()),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_USER_BY_ID(input.id)),
});

export const publicUsersRouter = createTRPCRouter({
  me: publicProcedure.query(async () => await QUERIES.PUBLIC.GET_ME()),
});
