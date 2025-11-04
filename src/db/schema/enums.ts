import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const channelEnum = pgEnum("channel", ["B2C", "B2B"]);

export const orderStatusEnum = pgEnum("order_status", [
  "cart",
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card_dotypay",
  "bank_transfer",
  "other",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "sent",
  "partially_paid",
  "paid",
  "void",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "inactive",
  // "sold_out",
  "archived",
]);

export const createChannelEnumSchema = createSelectSchema(channelEnum);

export const createOrderStatusEnumSchema = createSelectSchema(orderStatusEnum);
export const createPaymentStatusEnumSchema =
  createSelectSchema(paymentStatusEnum);
export const createPaymentMethodEnumSchema =
  createSelectSchema(paymentMethodEnum);
export const createInvoiceStatusEnumSchema =
  createSelectSchema(invoiceStatusEnum);
export const createProductStatusEnumSchema =
  createSelectSchema(productStatusEnum);
