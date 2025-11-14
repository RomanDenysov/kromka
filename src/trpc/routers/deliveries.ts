import z from "zod";
import { MUTATIONS } from "@/db/mutations/deliveries";
import { QUERIES } from "@/db/queries/deliveries";
import {
  deliverySchema,
  deliveryWithRelationsSchema,
} from "@/validation/deliveries";
import { createTRPCRouter, protectedProcedure } from "../init";

export const adminDeliveriesRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure
    .input(
      z
        .object({
          status: deliverySchema.shape.status.optional(),
          orderId: z.string().optional(),
        })
        .optional()
    )
    .output(z.array(deliveryWithRelationsSchema))
    .query(async ({ input }) => await QUERIES.ADMIN.GET_DELIVERIES(input)),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(deliveryWithRelationsSchema.nullable())
    .query(
      async ({ input }) =>
        (await QUERIES.ADMIN.GET_DELIVERY_BY_ID(input.id)) ?? null
    ),

  byOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .output(deliveryWithRelationsSchema.nullable())
    .query(
      async ({ input }) =>
        (await QUERIES.ADMIN.GET_DELIVERY_BY_ORDER_ID(input.orderId)) ?? null
    ),

  // MUTATIONS
  create: protectedProcedure
    .input(
      z.object({
        delivery: deliverySchema.omit({ id: true }),
      })
    )
    .output(deliverySchema)
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.CREATE_DELIVERY(input.delivery)
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        delivery: deliverySchema.omit({ id: true, orderId: true }).partial(),
      })
    )
    .output(deliverySchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_DELIVERY(input.id, input.delivery)
    ),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: deliverySchema.shape.status,
        additionalFields: deliverySchema
          .omit({ id: true, orderId: true, status: true })
          .partial()
          .optional(),
      })
    )
    .output(deliverySchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_DELIVERY_STATUS(
          input.id,
          input.status,
          input.additionalFields
        )
    ),
});
