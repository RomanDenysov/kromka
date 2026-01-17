import z from "zod";
import type { Address } from "@/db/types";

// Slovak ICO format: 8 digits
const ICO_REGEX = /^\d{8}$/;

// Slovak DIČ format: SK + 10 digits
const DIC_REGEX = /^SK\d{10}$/;

// Slovak IČ DPH format: SK + 10 digits
const ICDPH_REGEX = /^SK\d{10}$/;

// International phone format: +421XXXXXXXXX or +420XXXXXXXXX (12 chars after +)
const INTL_PHONE_REGEX = /^\+42[01]\d{9}$/;

// Local format: 0XXXXXXXXX (10 digits)
const LOCAL_PHONE_REGEX = /^0\d{9}$/;

const MAX_COMPANY_NAME_LENGTH = 200;
const MAX_CONTACT_NAME_LENGTH = 150;
const MAX_EMAIL_LENGTH = 150;
const MAX_PHONE_LENGTH = 16;
const MAX_MESSAGE_LENGTH = 2000;

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Telefónne číslo je povinné")
  .max(MAX_PHONE_LENGTH)
  .refine(
    (val) => {
      const digits = val.replace(/\s/g, "");
      if (digits.startsWith("+")) {
        return INTL_PHONE_REGEX.test(digits);
      }
      return LOCAL_PHONE_REGEX.test(digits);
    },
    { message: "Neplatné telefónne číslo (SK/CZ formát)" }
  );

const addressSchema = z.object({
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  googleId: z.string().optional(),
}) satisfies z.ZodType<Address>;

export const b2bApplicationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Názov spoločnosti je povinný")
    .max(MAX_COMPANY_NAME_LENGTH, "Názov spoločnosti je príliš dlhý"),
  ico: z
    .string()
    .trim()
    .min(1, "IČO je povinné")
    .regex(ICO_REGEX, "IČO musí mať 8 číslic"),
  dic: z
    .string()
    .trim()
    .regex(DIC_REGEX, "DIČ musí mať formát SK + 10 číslic")
    .optional()
    .or(z.literal("")),
  icDph: z
    .string()
    .trim()
    .regex(ICDPH_REGEX, "IČ DPH musí mať formát SK + 10 číslic")
    .optional()
    .or(z.literal("")),
  contactName: z
    .string()
    .trim()
    .min(1, "Meno kontaktnej osoby je povinné")
    .max(MAX_CONTACT_NAME_LENGTH, "Meno je príliš dlhé"),
  contactEmail: z
    .string()
    .trim()
    .email("Neplatná emailová adresa")
    .max(MAX_EMAIL_LENGTH, "Email je príliš dlhý"),
  contactPhone: phoneSchema,
  billingAddress: addressSchema.optional(),
  message: z
    .string()
    .trim()
    .max(MAX_MESSAGE_LENGTH, "Správa je príliš dlhá")
    .optional()
    .or(z.literal("")),
});

export type B2bApplicationSchema = z.infer<typeof b2bApplicationSchema>;
