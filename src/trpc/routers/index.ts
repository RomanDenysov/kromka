import { db } from "@/db";
import { createTRPCRouter, publicProcedure } from "../init";

const adminRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async () => {
    const users = await db.query.users.findMany();
    return users;
  }),
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
