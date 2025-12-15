import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { PRODUCT_STATUSES } from "@/db/types";
import { MAX_STRING_LENGTH } from "@/validation/constants";

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

export type ProductSchema = z.infer<typeof productSchema>;
