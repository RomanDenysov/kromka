import z from "zod";

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
  pickupDates: z.array(z.string()).optional(),
});
