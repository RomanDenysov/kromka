import { z } from "zod";

export const cancelOrderSchema = z.object({
  orderId: z.string(),
  reason: z.string().max(500).optional(),
});

export type CancelOrderData = z.infer<typeof cancelOrderSchema>;

export const updateOrderPickupSchema = z.object({
  orderId: z.string(),
  storeId: z.string().min(1),
  pickupDate: z.string(), // YYYY-MM-DD
  pickupTime: z.string(), // HH:MM
});

export type UpdateOrderPickupData = z.infer<typeof updateOrderPickupSchema>;
