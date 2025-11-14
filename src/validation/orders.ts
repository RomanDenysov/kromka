import z from "zod";
import {
  channelEnumSchema,
  orderStatusEnumSchema,
  paymentMethodEnumSchema,
  paymentStatusEnumSchema,
} from "@/db/schema/enums-zod";
import { MAX_STRING_LENGTH } from "./constants";

const productSnapshotSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
});

export const orderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  productSnapshot: productSnapshotSchema.nullable(),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  total: z.number().int().min(0),
});

export const orderStatusEventSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: orderStatusEnumSchema,
  note: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.date(),
});

export const paymentRefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amountCents: z.number().int().min(0),
  reason: z.string().nullable(),
  createdAt: z.date(),
});

export const orderPaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  method: paymentMethodEnumSchema,
  status: paymentStatusEnumSchema,
  amountCents: z.number().int().min(0),
  provider: z.string().max(MAX_STRING_LENGTH).nullable(),
  providerPaymentId: z.string().max(MAX_STRING_LENGTH).nullable(),
  authorizedAt: z.date().nullable(),
  capturedAt: z.date().nullable(),
  failedAt: z.date().nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const orderPaymentWithRefundsSchema = orderPaymentSchema.extend({
  refunds: z.array(paymentRefundSchema),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string().min(1).max(MAX_STRING_LENGTH),
  createdBy: z.string().nullable(),
  storeId: z.string().nullable(),
  companyId: z.string().nullable(),
  channel: channelEnumSchema,
  currentStatus: orderStatusEnumSchema,
  totalCents: z.number().int().min(0).nullable(),
  pickupDate: z.date().nullable(),
});

export const outputOrderSchema = orderSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const orderWithRelationsSchema = outputOrderSchema.extend({
  createdByUser: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      image: z.string().nullable(),
    })
    .nullable(),
  store: z
    .object({
      id: z.string(),
      name: z.string().max(MAX_STRING_LENGTH),
      slug: z.string().max(MAX_STRING_LENGTH),
    })
    .nullable(),
  company: z
    .object({
      id: z.string(),
      name: z.string().max(MAX_STRING_LENGTH),
      slug: z.string().max(MAX_STRING_LENGTH),
    })
    .nullable(),
  items: z.array(orderItemSchema),
  statusEvents: z.array(orderStatusEventSchema),
  payments: z.array(orderPaymentWithRefundsSchema),
});

export type OrderSchema = z.infer<typeof orderSchema>;
export type OutputOrderSchema = z.infer<typeof outputOrderSchema>;
export type OrderWithRelationsSchema = z.infer<typeof orderWithRelationsSchema>;
export type OrderItemSchema = z.infer<typeof orderItemSchema>;
export type OrderStatusEventSchema = z.infer<typeof orderStatusEventSchema>;
export type OrderPaymentSchema = z.infer<typeof orderPaymentSchema>;
export type OrderPaymentWithRefundsSchema = z.infer<
  typeof orderPaymentWithRefundsSchema
>;
export type PaymentRefundSchema = z.infer<typeof paymentRefundSchema>;
export type ProductSnapshotSchema = z.infer<typeof productSnapshotSchema>;
