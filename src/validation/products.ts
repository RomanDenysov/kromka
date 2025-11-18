import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { productStatusEnum } from "@/db/schema/enums";
import { outputCategorySchema } from "./categories";
import { MAX_STRING_LENGTH } from "./constants";
import { mediaSchema } from "./media";
import { productChannelSchema } from "./product-channels";

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>().nullable(),
  stock: z.number().min(0),
  isActive: z.boolean(),
  sortOrder: z.number(),
  status: z.enum(productStatusEnum.enumValues),
});

export const outputProductSchema = productSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable(),
  }),
  categories: z.array(outputCategorySchema),
  images: z.array(mediaSchema),
});

export const productWithRelationsSchema = outputProductSchema.extend({
  categories: z.array(outputCategorySchema),
  channels: z.array(productChannelSchema),
  images: z.array(mediaSchema),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type OutputProductSchema = z.infer<typeof outputProductSchema>;
