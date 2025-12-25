import { zodResolver } from "@hookform/resolvers/zod";
import type { JSONContent } from "@tiptap/react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { AdminStore } from "@/lib/queries/stores";
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
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  googleId: z.string(),
  postalCode: z.string().max(POSTAL_CODE_LENGTH),
});
const storeSchema = z.object({
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

export type StoreSchema = z.infer<typeof storeSchema>;

export function useStoreForm(store: AdminStore) {
  return useForm<StoreSchema>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name ?? "",
      slug: store?.slug ?? "",
      description: store?.description ?? null,
      phone: store?.phone ?? "",
      email: store?.email ?? "kromka@kavejo.sk",
      isActive: store?.isActive ?? false,
      sortOrder: store?.sortOrder ?? 0,
      imageId: store?.imageId ?? null,
      address: store?.address ?? null,
      latitude: store?.latitude ?? null,
      longitude: store?.longitude ?? null,
      openingHours: store?.openingHours ?? {
        regularHours: {
          monday: "closed",
          tuesday: "closed",
          wednesday: "closed",
          thursday: "closed",
          friday: "closed",
          saturday: "closed",
          sunday: "closed",
        },
        exceptions: {},
      },
    },
  });
}
