import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { MAX_STRING_LENGTH } from "@/validation/constants";

const POSTAL_CODE_LENGTH = 6;

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
export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  googleId: z.string(),
  postalCode: z.string().max(POSTAL_CODE_LENGTH),
});
export const storeSchema = z.object({
  id: z.string().optional(),
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
