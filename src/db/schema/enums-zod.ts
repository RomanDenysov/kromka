import { z } from "zod";

/**
 * Manual Zod schemas for database enums
 * Used for form validation and type inference
 */

export const channelEnumSchema = z.enum(["B2C", "B2B"]);

export const orderStatusEnumSchema = z.enum([
  "cart",
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnumSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const paymentMethodEnumSchema = z.enum([
  "cash",
  "card_dotypay",
  "bank_transfer",
  "other",
]);

export const invoiceStatusEnumSchema = z.enum([
  "draft",
  "issued",
  "sent",
  "partially_paid",
  "paid",
  "void",
]);

export const productStatusEnumSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
]);
