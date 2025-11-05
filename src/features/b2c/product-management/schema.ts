/**
 * Product Management Schemas
 * Built on top of centralized database schemas
 */

import { z } from "zod";
import { channelEnumSchema, productStatusEnumSchema } from "@/db/schemas";

// ============================================================================
// FORM SCHEMAS (for UI forms - description as string, dates as Date | undefined)
// ============================================================================

/**
 * Channel configuration for forms
 */
export const channelConfigFormSchema = z.object({
  channel: channelEnumSchema,
  isListed: z.boolean().default(true),
});

/**
 * Price configuration for forms
 */
export const priceFormSchema = z.object({
  id: z.string().optional(), // For updates
  channel: channelEnumSchema,
  orgId: z.string().optional(), // Organization ID for B2B pricing
  currency: z.string().min(1),
  amountCents: z.number().int().min(0),
  minQty: z.number().int().min(1).default(1),
  priority: z.number().int().min(0).default(0),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Product form schema - matches the form structure
 * Description is a string (not JSON), dates are Date | undefined
 */
export const productFormSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  sku: z.string().min(1).max(255),
  description: z.string().nullable(),
  stock: z.number().int().min(0).default(0),
  categories: z.array(z.string()).default([]),
  channels: z.array(channelConfigFormSchema).default([]),
  prices: z.array(priceFormSchema).default([]),
  status: productStatusEnumSchema,
  isActive: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChannelConfigFormSchema = z.infer<typeof channelConfigFormSchema>;
export type PriceFormSchema = z.infer<typeof priceFormSchema>;
export type ProductFormSchema = z.infer<typeof productFormSchema>;

// Re-export database schemas for convenience
export type {
  CreateProduct,
  CreateProductWithRelations,
  Product,
  ProductWithRelations,
  UpdateProduct,
  UpdateProductWithRelations,
} from "@/db/schemas";
