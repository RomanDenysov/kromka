import z from "zod";
import { deliveryStatusEnumSchema } from "@/db/schema/enums-zod";
import { MAX_STRING_LENGTH } from "./constants";

const deliveryAddressSchema = z.object({
  street: z.string().max(MAX_STRING_LENGTH).optional(),
  postalCode: z.string().max(MAX_STRING_LENGTH).optional(),
  city: z.string().max(MAX_STRING_LENGTH).optional(),
  country: z.string().max(MAX_STRING_LENGTH).optional(),
  contactName: z.string().max(MAX_STRING_LENGTH).optional(),
  contactPhone: z.string().max(MAX_STRING_LENGTH).optional(),
});

export const deliverySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  windowStart: z.date().nullable(),
  windowEnd: z.date().nullable(),
  address: deliveryAddressSchema.nullable(),
  status: deliveryStatusEnumSchema,
  notes: z.string().nullable(),
});

export const outputDeliverySchema = deliverySchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const deliveryWithRelationsSchema = outputDeliverySchema.extend({
  order: z.object({
    id: z.string(),
    orderNumber: z.string().max(MAX_STRING_LENGTH),
    currentStatus: z.string(),
  }),
});

export type DeliverySchema = z.infer<typeof deliverySchema>;
export type OutputDeliverySchema = z.infer<typeof outputDeliverySchema>;
export type DeliveryWithRelationsSchema = z.infer<
  typeof deliveryWithRelationsSchema
>;
export type DeliveryAddressSchema = z.infer<typeof deliveryAddressSchema>;
