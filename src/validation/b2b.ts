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

// ---- Admin actions schemas ----

const PAYMENT_TERM_MIN_DAYS = 1;
const PAYMENT_TERM_MAX_DAYS = 365;

/**
 * Admin: update organization billing/profile data.
 * Note: optional string fields accept empty string to allow clearing values.
 */
export const updateOrganizationSchema = z.object({
  organizationId: z.string().trim().min(1, "Chýba ID organizácie"),
  billingName: z
    .string()
    .trim()
    .max(MAX_COMPANY_NAME_LENGTH, "Fakturačný názov je príliš dlhý")
    .optional()
    .or(z.literal("")),
  ico: z
    .string()
    .trim()
    .regex(ICO_REGEX, "IČO musí mať 8 číslic")
    .optional()
    .or(z.literal("")),
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
  billingEmail: z
    .string()
    .trim()
    .email("Neplatná emailová adresa")
    .max(MAX_EMAIL_LENGTH, "Email je príliš dlhý")
    .optional()
    .or(z.literal("")),
  paymentTermDays: z
    .number()
    .int("Splatnosť musí byť celé číslo")
    .min(
      PAYMENT_TERM_MIN_DAYS,
      `Minimálna splatnosť je ${PAYMENT_TERM_MIN_DAYS}`
    )
    .max(
      PAYMENT_TERM_MAX_DAYS,
      `Maximálna splatnosť je ${PAYMENT_TERM_MAX_DAYS}`
    )
    .optional(),
  priceTierId: z.string().trim().optional().or(z.literal("")),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;

export const approveB2bApplicationSchema = z.object({
  applicationId: z.string().trim().min(1, "Chýba ID žiadosti"),
  priceTierId: z.string().trim().min(1, "Vyberte cenovú skupinu"),
});

export type ApproveB2bApplicationSchema = z.infer<
  typeof approveB2bApplicationSchema
>;

export const rejectB2bApplicationSchema = z.object({
  applicationId: z.string().trim().min(1, "Chýba ID žiadosti"),
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Zadajte dôvod zamietnutia")
    .max(MAX_MESSAGE_LENGTH, "Dôvod je príliš dlhý"),
});

export type RejectB2bApplicationSchema = z.infer<
  typeof rejectB2bApplicationSchema
>;
