import type { JSONContent } from "@tiptap/react";
import z from "zod";

const MAX_STRING_LENGTH = 255;

const workDaySchema = z.object({
  period: z
    .object({
      open: z.string(),
      close: z.string(),
    })
    .nullable(),
  isClosed: z.boolean(),
});

const openingHoursSchema = z.object({
  weekdays: workDaySchema,
  saturday: workDaySchema,
  sunday: workDaySchema,
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  googleId: z.string().min(1),
  postalCode: z.string().min(1).max(MAX_STRING_LENGTH),
});

const storeMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
});

export const storeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>(),
  phone: z.string(),
  email: z.email(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  openingHours: openingHoursSchema,
  address: addressSchema,
  imageId: z.string().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export const storeWithRelationsSchema = storeSchema.extend({
  members: z.array(storeMemberSchema),
});
