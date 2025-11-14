import z from "zod";
import { channelEnumSchema } from "@/db/schema/enums-zod";
import { MAX_STRING_LENGTH } from "./constants";

export const priceSchema = z.object({
  id: z.string(),
  productId: z.string(),
  channel: channelEnumSchema,
  orgId: z.string().nullable(),
  amountCents: z.number().int().min(0),
  minQty: z.number().int().min(1),
  priority: z.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
});

export const outputPriceSchema = priceSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      image: z.string().nullable(),
    })
    .nullable(),
});

export const priceWithRelationsSchema = outputPriceSchema.extend({
  organization: z
    .object({
      id: z.string(),
      name: z.string().max(MAX_STRING_LENGTH),
      slug: z.string().max(MAX_STRING_LENGTH),
    })
    .nullable(),
});

export type PriceSchema = z.infer<typeof priceSchema>;
export type OutputPriceSchema = z.infer<typeof outputPriceSchema>;
export type PriceWithRelationsSchema = z.infer<typeof priceWithRelationsSchema>;
