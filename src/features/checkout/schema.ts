import z from "zod";
import { PAYMENT_METHODS } from "@/db/types";

export const checkoutFormSchema = z.object({
  name: z.string().min(1, "Meno je povinné"),
  email: z.email("Neplatná emailová adresa"),
  phone: z.string().min(1, "Telefónne číslo je povinné"),

  paymentMethod: z.enum(PAYMENT_METHODS, "Spôsob platby je povinný"),
  pickupDate: z.date().min(new Date(), "Dátum vyzdvihnutia je povinný"),
  pickupTime: z.string().min(1, "Čas vyzdvihnutia je povinný"),

  storeId: z.string().min(1, "Miesto vyzdvihnutia je povinné"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
