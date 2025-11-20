import z from "zod";
import { MAX_DESCRIPTION_LENGTH, MAX_STRING_LENGTH } from "./constants";

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  parentId: z.string().nullable(),
  showInMenu: z.boolean(),
  isActive: z.boolean(),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  imageId: z.string().nullable(),
  sortOrder: z.number(),
});

export const outputCategorySchema = updateCategorySchema.extend({
  id: z.string(),
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

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type OutputCategorySchema = z.infer<typeof outputCategorySchema>;
