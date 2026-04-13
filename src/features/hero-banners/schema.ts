import { z } from "zod";

export const heroBannerSchema = z.object({
  name: z.string().min(1, "Názov je povinný"),
  heading: z.string().optional(),
  subtitle: z.string().optional(),
  imageId: z.string().nullable(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

export type HeroBannerSchema = z.infer<typeof heroBannerSchema>;
