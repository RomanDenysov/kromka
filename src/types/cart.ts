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

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  showInB2b: boolean;
  images: Array<{ url: string }>;
};

export type CartItem = {
  cartId: string;
  productId: string;
  quantity: number;
  priceCents: number;
  product: CartProduct;
};

export type Cart = {
  id: string;
  userId: string;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
};

export type CartItems = Cart["items"];
