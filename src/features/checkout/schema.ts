import { startOfToday } from "date-fns";
import z from "zod";
import { PAYMENT_METHODS } from "@/db/types";

/** International format: +421XXXXXXXXX or +420XXXXXXXXX (12 chars after +) */
const INTL_PHONE_REGEX = /^\+42[01]\d{9}$/;

/** Local format: 0XXXXXXXXX (10 digits) */
const LOCAL_PHONE_REGEX = /^0\d{9}$/;
/** Max lengths for contact fields */
const MAX_NAME_LENGTH = 150;
const MAX_EMAIL_LENGTH = 150;
const MAX_PHONE_LENGTH = 16;
/**
 * Validates Slovak (+421) or Czech (+420) phone numbers
 * Formats: +421 XXX XXX XXX, +420 XXX XXX XXX, 0XXX XXX XXX
 */
const phoneSchema = z
  .string()
  .min(1, "Telefónne číslo je povinné")
  .max(MAX_PHONE_LENGTH)
  .refine(
    (val) => {
      // Remove spaces for validation
      const digits = val.replace(/\s/g, "");
      // International format: +421XXXXXXXXX or +420XXXXXXXXX
      if (digits.startsWith("+")) {
        return INTL_PHONE_REGEX.test(digits);
      }
      // Local format: 0XXXXXXXXX (10 digits)
      return LOCAL_PHONE_REGEX.test(digits);
    },
    { message: "Neplatné telefónne číslo (SK/CZ formát)" }
  );

/** Schema for user/guest contact info */
export const userInfoSchema = z.object({
  name: z.string().min(1, "Meno je povinné").max(MAX_NAME_LENGTH),
  email: z.string().email("Neplatná emailová adresa").max(MAX_EMAIL_LENGTH),
  phone: phoneSchema,
});

export type UserInfoData = z.infer<typeof userInfoSchema>;

/** Unified schema for checkout form including customer info */
export const checkoutFormSchema = z.object({
  // Customer info fields
  name: z.string().min(1, "Meno je povinné").max(MAX_NAME_LENGTH),
  email: z.string().email("Neplatná emailová adresa").max(MAX_EMAIL_LENGTH),
  phone: phoneSchema,
  // Checkout-specific fields
  paymentMethod: z.enum(PAYMENT_METHODS, "Spôsob platby je povinný"),
  pickupDate: z
    .date()
    .refine((date) => date >= startOfToday(), "Dátum vyzdvihnutia je povinný"),
  pickupTime: z.string().min(1, "Čas vyzdvihnutia je povinný"),
  storeId: z.string().min(1, "Miesto vyzdvihnutia je povinné"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

/** B2B checkout form schema — delivery-based, no store selection */
export const b2bCheckoutFormSchema = z.object({
  pickupDate: z
    .date()
    .refine((date) => date >= startOfToday(), "Dátum doručenia je povinný"),
  pickupTime: z.string().min(1, "Čas doručenia je povinný"),
  paymentMethod: z.enum(["in_store", "invoice"], "Spôsob platby je povinný"),
  /**
   * Future: recurring order schedule.
   * When implemented, this will allow B2B customers to set up automatic
   * recurring orders (e.g., every Friday, or every 10th of the month).
   */
  recurringSchedule: z
    .object({
      type: z.enum(["weekly", "monthly"]),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(28).optional(),
    })
    .optional(),
});

export type B2bCheckoutFormData = z.infer<typeof b2bCheckoutFormSchema>;
