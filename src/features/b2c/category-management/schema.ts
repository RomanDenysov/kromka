import z from "zod";

const MAX_NAME_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  slug: z.string().min(1).max(MAX_NAME_LENGTH),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
