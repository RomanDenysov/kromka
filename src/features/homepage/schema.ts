import z from "zod";
import {
  HOMEPAGE_DEFAULT_CTA_HREF,
  HOMEPAGE_DEFAULT_CTA_LABEL,
  HOMEPAGE_DEFAULT_ITEM_LIMIT,
  HOMEPAGE_MAX_ITEM_LIMIT,
} from "@/features/homepage/constants";
import { MAX_STRING_LENGTH } from "@/lib/constants";

const sectionIdSchema = z.string().min(1).max(MAX_STRING_LENGTH);
const productIdSchema = z.string().min(1).max(MAX_STRING_LENGTH);

const carouselBaseSchema = z.object({
  title: z.string().min(1).max(120),
  ctaLabel: z.string().min(1).max(60).default(HOMEPAGE_DEFAULT_CTA_LABEL),
  ctaHref: z
    .string()
    .min(1)
    .max(MAX_STRING_LENGTH)
    .refine((value) => value.startsWith("/"), {
      message: "CTA must be an internal path",
    })
    .default(HOMEPAGE_DEFAULT_CTA_HREF),
  itemLimit: z
    .number()
    .int()
    .min(1)
    .max(HOMEPAGE_MAX_ITEM_LIMIT)
    .default(HOMEPAGE_DEFAULT_ITEM_LIMIT),
});

const carouselBodySchema = z.discriminatedUnion("sourceType", [
  carouselBaseSchema.extend({
    sourceType: z.literal("category"),
    categoryId: z.string().min(1).max(MAX_STRING_LENGTH),
  }),
  carouselBaseSchema.extend({
    sourceType: z.literal("manual_products"),
    productIds: z.array(productIdSchema).min(1).max(HOMEPAGE_MAX_ITEM_LIMIT),
  }),
  carouselBaseSchema.extend({
    sourceType: z.literal("best_sellers"),
  }),
]);

export const createCarouselSectionSchema = carouselBodySchema;

export const updateCarouselSectionSchema = z
  .object({
    sectionId: sectionIdSchema,
  })
  .and(carouselBodySchema);

export const deleteCarouselSectionSchema = z.object({
  sectionId: sectionIdSchema,
});

export const duplicateCarouselSectionSchema = z.object({
  sectionId: sectionIdSchema,
});

export const toggleSectionSchema = z.object({
  sectionId: sectionIdSchema,
  isEnabled: z.boolean(),
});

export const reorderSectionsSchema = z.object({
  orderedSectionIds: z.array(sectionIdSchema).min(1),
});

export type CreateCarouselSectionSchema = z.infer<
  typeof createCarouselSectionSchema
>;
export type UpdateCarouselSectionSchema = z.infer<
  typeof updateCarouselSectionSchema
>;
export type ReorderSectionsSchema = z.infer<typeof reorderSectionsSchema>;
