import z from "zod";

export const cartItemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().positive(),
});

export const cartSchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartItemSchema>;
