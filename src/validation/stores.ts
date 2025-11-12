import type { JSONContent } from "@tiptap/react";
import z from "zod";

const MAX_STRING_LENGTH = 255;

const workDaySchema = z.object({
  open: z.string(),
  close: z.string(),
});

const openingHoursSchema = z.object({
  weekdays: workDaySchema,
  saturday: workDaySchema.optional(),
  sunday: workDaySchema.optional(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  googleId: z.string().min(1),
  postalCode: z.string().min(1).max(MAX_STRING_LENGTH),
});

export const storeSchema = z.object({
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>(),
  phone: z.string(),
  email: z.email(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  openingHours: openingHoursSchema.nullable(),
  address: addressSchema,
  imageId: z.string().nullable(),
});
