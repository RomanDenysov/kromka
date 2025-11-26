import type { RouterOutputs } from "@/trpc/routers";

export type Cart = RouterOutputs["public"]["cart"]["getCart"];
export type CartItems = NonNullable<Cart>["items"];
export type CartItem = NonNullable<CartItems>[number];

/** Minimal product data needed for optimistic cart updates */
export type ProductMeta = {
  id: string;
  name: string;
  priceCents: number;
  slug: string;
  imageUrl?: string;
};

export type AddToCartParams = {
  productId: string;
  quantity: number;
  /** Optional product data for instant optimistic UI */
  product?: ProductMeta;
  /** Optional callback fired on successful add */
  onSuccess?: () => void;
};
