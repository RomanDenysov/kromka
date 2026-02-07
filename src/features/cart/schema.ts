import z from "zod";

export const cartItemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).max(999),
});

export const cartSchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartItemSchema>;
