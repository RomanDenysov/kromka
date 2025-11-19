import type { JSONContent } from "@tiptap/react";
import z from "zod";

const MAX_STRING_LENGTH = 255;

const POSTAL_CODE_LENGTH = 6;

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  googleId: z.string().min(1),
  postalCode: z.string().min(1).max(POSTAL_CODE_LENGTH),
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
  imageId: z.string().nullable(),
  address: addressSchema,
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
});

export type StoreSchema = z.infer<typeof storeSchema>;
