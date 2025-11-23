import z from "zod";
import { QUERIES } from "@/db/queries/orders";
import { createTRPCRouter, roleProcedure } from "../init";

export const adminOrdersRouter = createTRPCRouter({
  byId: roleProcedure("admin")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_ORDER_BY_ID(input.id)),
});
