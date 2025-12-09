import z from "zod";

const BUSINESS_TYPE_OPTIONS = [
  "restaurant",
  "hotel",
  "cafe",
  "shop",
  "other",
] as const;

export const supportRequestSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné"),
  email: z.string().trim().email("Neplatná emailová adresa"),
  rootCause: z.string().trim().min(1, "Príčina problému je povinná"),
  message: z.string().trim().min(1, "Správa je povinná"),
});

export const b2bRequestSchema = z.object({
  companyName: z.string().trim().min(1, "Názov spoločnosti je povinný"),
  businessType: z.enum(BUSINESS_TYPE_OPTIONS, {
    errorMap: () => ({ message: "Vyberte platný typ podniku" }),
  }),
  userName: z.string().trim().min(1, "Meno a priezvisko je povinné"),
  email: z.string().trim().email("Neplatná emailová adresa"),
  phone: z.string().trim().min(1, "Telefónne číslo je povinné"),
});

export type SupportRequestSchema = z.infer<typeof supportRequestSchema>;
export type B2BRequestSchema = z.infer<typeof b2bRequestSchema>;
