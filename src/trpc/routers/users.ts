import "server-only";
import { QUERIES } from "@/db/queries/users";
import { createTRPCRouter, sessionProcedure } from "../init";

export const publicUsersRouter = createTRPCRouter({
  me: sessionProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      return null;
    }

    const user = await QUERIES.PUBLIC.GET_ME(ctx.session.user.id);
    return user;
  }),
});
