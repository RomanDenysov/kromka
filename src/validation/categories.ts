import z from "zod";
import { MAX_DESCRIPTION_LENGTH, MAX_STRING_LENGTH } from "./constants";

export const updateCategorySchema = z.object({
  id: z.string(),
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

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  parentId: z.string().nullable(),
  showInMenu: z.boolean(),
  isActive: z.boolean(),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  imageId: z.string().nullable(),
  sortOrder: z.number(),
});

export type CategorySchema = z.infer<typeof categorySchema>;
