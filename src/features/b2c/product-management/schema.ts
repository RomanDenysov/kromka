import z from "zod";

const MAX_NAME_LENGTH = 255;

export const channelEnum = z.enum(["B2C", "B2B"]);
export const statusEnum = z.enum(["draft", "active", "inactive", "archived"]);

export const createProductSchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  slug: z.string().min(1).max(MAX_NAME_LENGTH),
  sku: z.string().min(1).max(MAX_NAME_LENGTH),
  description: z.json().optional(),
  stock: z.number().optional(),
  prices: z.array(
    z.object({
      channel: channelEnum,
      orgId: z.string().optional(),
      currency: z.string(),
      amountCents: z.number().positive(),
      minQty: z.number().optional(),
      priority: z.number().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    })
  ),
  categories: z.array(z.string()),
  status: statusEnum.default("draft"),
  isActive: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
