import type { JSONContent } from "@tiptap/react";
import z from "zod";

const MAX_STRING_LENGTH = 255;

const POSTAL_CODE_LENGTH = 6;

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  googleId: z.string(),
  postalCode: z.string().max(POSTAL_CODE_LENGTH),
});

const timeRangeSchema = z
  .object({
    start: z.string(),
    end: z.string(),
  })
  .nullable();

const dayScheduleSchema = z.literal("closed").or(timeRangeSchema).nullable();

export const openingHoursSchema = z.object({
  regularHours: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  }),
  exceptions: z.record(z.string(), dayScheduleSchema).optional(),
});

export const storeSchema = z.object({
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>().nullable(),
  phone: z.string(),
  email: z.email(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  imageId: z.string().nullable(),
  address: addressSchema.partial().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  openingHours: openingHoursSchema,
});

export type StoreSchema = z.infer<typeof storeSchema>;
