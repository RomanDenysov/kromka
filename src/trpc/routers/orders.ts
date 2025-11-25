import z from "zod";
import { QUERIES } from "@/db/queries/orders";
import type { OrderStatus } from "@/db/schema/orders";
import { createTRPCRouter, roleProcedure } from "../init";

export const adminOrdersRouter = createTRPCRouter({
  list: roleProcedure("admin")
    .input(
      z
        .object({
          status: z.string().optional(),
          storeId: z.string().optional(),
          companyId: z.string().optional(),
          createdBy: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) =>
      QUERIES.ADMIN.GET_ORDERS({
        status: input?.status as OrderStatus,
        storeId: input?.storeId,
        companyId: input?.companyId,
        createdBy: input?.createdBy,
      })
    ),
  byId: roleProcedure("admin")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_ORDER_BY_ID(input.id)),
});
