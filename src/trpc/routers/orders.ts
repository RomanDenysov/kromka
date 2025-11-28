import z from "zod";
import { MUTATIONS } from "@/db/mutations/orders";
import { QUERIES } from "@/db/queries/orders";
import { createTRPCRouter, roleProcedure } from "../init";

// TODO: Move to constants
const ORDER_STATUSES = [
  "cart",
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
] as const;

export const adminOrdersRouter = createTRPCRouter({
  list: roleProcedure("admin")
    .input(
      z
        .object({
          status: z.enum(ORDER_STATUSES).optional(),
          storeId: z.string().optional(),
          companyId: z.string().optional(),
          createdBy: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) =>
      QUERIES.ADMIN.GET_ORDERS({
        status: input?.status,
        storeId: input?.storeId,
        companyId: input?.companyId,
        createdBy: input?.createdBy,
      })
    ),
  byId: roleProcedure("admin")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_ORDER_BY_ID(input.id)),
  updateStatus: roleProcedure("admin")
    .input(
      z.object({
        id: z.string(),
        status: z.enum(ORDER_STATUSES),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      MUTATIONS.ADMIN.UPDATE_ORDER_STATUS(
        input.id,
        input.status,
        ctx.session.user.id,
        input.note
      )
    ),
});
