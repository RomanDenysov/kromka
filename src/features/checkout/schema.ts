import { startOfToday } from "date-fns";
import z from "zod";
import { PAYMENT_METHODS } from "@/db/types";

/** Schema for user/guest contact info - managed separately from checkout */
export const userInfoSchema = z.object({
  name: z.string().min(1, "Meno je povinné"),
  email: z.email("Neplatná emailová adresa"),
  phone: z.string().min(1, "Telefónne číslo je povinné"),
});

export type UserInfoData = z.infer<typeof userInfoSchema>;

/** Schema for checkout-specific fields only */
export const checkoutFormSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS, "Spôsob platby je povinný"),
  pickupDate: z
    .date()
    .refine((date) => date >= startOfToday(), "Dátum vyzdvihnutia je povinný"),
  pickupTime: z.string().min(1, "Čas vyzdvihnutia je povinný"),
  storeId: z.string().min(1, "Miesto vyzdvihnutia je povinné"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
