import z from "zod";
import { MUTATIONS } from "@/db/mutations/orders";
import { QUERIES } from "@/db/queries/orders";
import {
  orderItemSchema,
  orderPaymentSchema,
  orderPaymentWithRefundsSchema,
  orderSchema,
  orderStatusEventSchema,
  orderWithRelationsSchema,
  paymentRefundSchema,
} from "@/validation/orders";
import { createTRPCRouter, protectedProcedure } from "../init";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function transformOrder(order: any) {
  if (!order) {
    return null;
  }
  return {
    ...order,
    createdByUser: order.createdBy ?? null,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    statusEvents: order.statusEvents?.map((event: any) => ({
      ...event,
      createdBy: event.author?.id ?? event.createdBy ?? null,
    })),
  };
}

export const adminOrdersRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure
    .input(
      z
        .object({
          status: orderSchema.shape.currentStatus.optional(),
          channel: orderSchema.shape.channel.optional(),
          storeId: z.string().optional(),
          companyId: z.string().optional(),
          createdBy: z.string().optional(),
        })
        .optional()
    )
    .output(z.array(orderWithRelationsSchema.nullable()))
    .query(async ({ input }) => {
      const orders = await QUERIES.ADMIN.GET_ORDERS(input);
      return orders.map(transformOrder);
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(orderWithRelationsSchema.nullable())
    .query(async ({ input }) => {
      const order = await QUERIES.ADMIN.GET_ORDER_BY_ID(input.id);
      return transformOrder(order);
    }),

  byNumber: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .output(orderWithRelationsSchema.nullable())
    .query(async ({ input }) => {
      const order = await QUERIES.ADMIN.GET_ORDER_BY_NUMBER(input.orderNumber);
      return transformOrder(order);
    }),

  items: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .output(z.array(orderItemSchema))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_ORDER_ITEMS(input.orderId)
    ),

  statusEvents: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .output(z.array(orderStatusEventSchema))
    .query(async ({ input }) => {
      const events = await QUERIES.ADMIN.GET_ORDER_STATUS_EVENTS(input.orderId);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return events.map((event: any) => ({
        ...event,
        createdBy: event.author?.id ?? event.createdBy ?? null,
      }));
    }),

  payments: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .output(z.array(orderPaymentWithRefundsSchema))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_ORDER_PAYMENTS(input.orderId)
    ),

  // MUTATIONS
  createDraft: protectedProcedure
    .input(
      orderSchema
        .pick({
          storeId: true,
          companyId: true,
          channel: true,
          currentStatus: true,
          totalCents: true,
          pickupDate: true,
        })
        .partial()
        .optional()
    )
    .output(orderSchema)
    .mutation(
      async ({ input, ctx }) =>
        await MUTATIONS.ADMIN.CREATE_DRAFT_ORDER(
          ctx.session.user.id,
          input ?? {}
        )
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        order: orderSchema
          .pick({
            storeId: true,
            companyId: true,
            channel: true,
            currentStatus: true,
            totalCents: true,
            pickupDate: true,
          })
          .partial(),
      })
    )
    .output(orderSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_ORDER(input.id, input.order)
    ),

  createStatusEvent: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: orderStatusEventSchema.shape.status,
        note: orderStatusEventSchema.shape.note.optional(),
      })
    )
    .output(orderStatusEventSchema)
    .mutation(
      async ({ input, ctx }) =>
        await MUTATIONS.ADMIN.CREATE_ORDER_STATUS_EVENT(
          input.orderId,
          input.status,
          input.note ?? null,
          ctx.session.user.id
        )
    ),

  addItem: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        item: orderItemSchema.omit({ orderId: true }),
      })
    )
    .output(orderItemSchema)
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.ADD_ORDER_ITEM(input.orderId, {
          ...input.item,
          productSnapshot: input.item.productSnapshot ?? null,
        })
    ),

  updateItem: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        productId: z.string(),
        item: orderItemSchema
          .omit({ orderId: true, productId: true })
          .partial(),
      })
    )
    .output(orderItemSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_ORDER_ITEM(
          input.orderId,
          input.productId,
          input.item
        )
    ),

  removeItem: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        productId: z.string(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.REMOVE_ORDER_ITEM(input.orderId, input.productId)
    ),

  createPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        payment: orderPaymentSchema.omit({
          id: true,
          orderId: true,
          createdAt: true,
          updatedAt: true,
        }),
      })
    )
    .output(orderPaymentSchema)
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.CREATE_ORDER_PAYMENT(input.orderId, {
          ...input.payment,
          provider: input.payment.provider ?? null,
          providerPaymentId: input.payment.providerPaymentId ?? null,
          authorizedAt: input.payment.authorizedAt ?? null,
          capturedAt: input.payment.capturedAt ?? null,
          failedAt: input.payment.failedAt ?? null,
          failureReason: input.payment.failureReason ?? null,
        })
    ),

  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        status: orderPaymentSchema.shape.status,
        additionalFields: orderPaymentSchema
          .omit({
            id: true,
            orderId: true,
            createdAt: true,
            updatedAt: true,
            status: true,
          })
          .partial()
          .optional(),
      })
    )
    .output(orderPaymentSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_PAYMENT_STATUS(
          input.paymentId,
          input.status,
          input.additionalFields
        )
    ),

  createRefund: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        refund: paymentRefundSchema.omit({
          id: true,
          paymentId: true,
          createdAt: true,
        }),
      })
    )
    .output(paymentRefundSchema)
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.CREATE_PAYMENT_REFUND(input.paymentId, {
          ...input.refund,
          reason: input.refund.reason ?? null,
        })
    ),
});
