import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, { message: "Názov musí mať aspoň 3 znaky" }),
  slug: z.string().min(3, { message: "Slug musí mať aspoň 3 znaky" }),
  description: z.string(),
  isVisible: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});
