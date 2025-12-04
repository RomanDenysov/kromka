import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { categorySchema } from "./categories";
import { MAX_STRING_LENGTH } from "./constants";
import { mediaSchema } from "./media";

const PRODUCT_STATUSES = ["draft", "active", "sold", "archived"] as const;

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  status: z.enum(PRODUCT_STATUSES),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  priceCents: z.number(),
});

export const updateProductSchema = z.object({
  ...productSchema.shape,
  categoryId: z.string().nullable(),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

export const priceSchema = z.object({
  minQty: z.number(),
  priceCents: z.number(),
  priceTier: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const outputProductSchema = productSchema.extend({
  category: categorySchema.nullable(),
  images: z.array(z.string()),
  prices: z.array(priceSchema),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productWithRelationsSchema = outputProductSchema.extend({
  category: categorySchema.nullable(),
  images: z.array(mediaSchema),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type OutputProductSchema = z.infer<typeof outputProductSchema>;
