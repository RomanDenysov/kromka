import z from "zod";
import { invoiceStatusEnumSchema } from "@/db/schema/enums-zod";
import { MAX_STRING_LENGTH, MAX_TAX_RATE_PCT } from "./constants";

const addressSchema = z.object({
  street: z.string().max(MAX_STRING_LENGTH).optional(),
  postalCode: z.string().max(MAX_STRING_LENGTH).optional(),
  city: z.string().max(MAX_STRING_LENGTH).optional(),
  country: z.string().max(MAX_STRING_LENGTH).optional(),
});

export const invoiceItemSchema = z.object({
  invoiceId: z.string(),
  lineId: z.string(),
  productId: z.string().nullable(),
  sku: z.string().max(MAX_STRING_LENGTH).nullable(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
  taxRatePct: z.number().int().min(0).max(MAX_TAX_RATE_PCT).nullable(),
  totalCents: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  companyId: z.string().nullable(),
  number: z.string().min(1).max(MAX_STRING_LENGTH),
  series: z.string().min(1).max(MAX_STRING_LENGTH),
  status: invoiceStatusEnumSchema,
  createdBy: z.string().nullable(),
  issueDate: z.date(),
  dueDate: z.date().nullable(),
  sentAt: z.date().nullable(),
  paidAt: z.date().nullable(),
  billingAddress: addressSchema.nullable(),
  notes: z.string().nullable(),
  subtotalCents: z.number().int().min(0),
  taxCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
});

export const outputInvoiceSchema = invoiceSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const invoiceWithRelationsSchema = outputInvoiceSchema.extend({
  company: z
    .object({
      id: z.string(),
      name: z.string().max(MAX_STRING_LENGTH),
      slug: z.string().max(MAX_STRING_LENGTH),
    })
    .nullable(),
  createdByUser: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      image: z.string().nullable(),
    })
    .nullable(),
  items: z.array(invoiceItemSchema),
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;
export type OutputInvoiceSchema = z.infer<typeof outputInvoiceSchema>;
export type InvoiceWithRelationsSchema = z.infer<
  typeof invoiceWithRelationsSchema
>;
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
