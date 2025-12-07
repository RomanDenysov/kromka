"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useContext,
  useOptimistic,
  useTransition,
} from "react";
import { toast } from "sonner";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateCartItemQuantity as updateQuantityAction,
} from "@/lib/actions/cart";
import type { Product } from "@/lib/queries/products";
import type { Cart, CartItem } from "@/types/cart";

type OptimisticAction =
  | { type: "add"; productId: string; quantity: number; product?: Product }
  | { type: "remove"; productId: string }
  | { type: "update"; productId: string; quantity: number };

type CartContextValue = {
  cart: Cart | null;
  addToCart: (productId: string, quantity: number, product?: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  itemsCount: number;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(
  state: Cart | null,
  action: OptimisticAction
): Cart | null {
  if (!state) {
    return state;
  }

  switch (action.type) {
    case "add": {
      const existing = state.items.find(
        (i) => i.productId === action.productId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.productId
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        };
      }
      if (!action.product) {
        return state;
      }
      const newItem: CartItem = {
        cartId: state.id,
        productId: action.productId,
        quantity: action.quantity,
        priceCents: action.product.priceCents,
        product: action.product,
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case "remove":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.productId),
      };

    case "update":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.productId !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };

    default:
      return state;
  }
}

export function CartContextProvider({
  cartPromise,
  children,
}: {
  cartPromise: Promise<Cart | null>;
  children: ReactNode;
}) {
  const initialCart = use(cartPromise);

  const [_isPending, startTransition] = useTransition();
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer
  );
  const addToCart = useCallback(
    (productId: string, quantity: number, product?: Product) => {
      startTransition(async () => {
        updateOptimisticCart({ type: "add", productId, quantity, product });
        try {
          await addToCartAction(productId, quantity);
          // We don't need to show a toast here because the cart is updated optimistically
          // toast.success("Pridané do košíka");
        } catch (error) {
          toast.error("Nepodarilo sa pridať do košíka");
          // biome-ignore lint/suspicious/noConsole: Error reporting
          console.error(error);
        }
      });
    },
    [updateOptimisticCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      startTransition(async () => {
        updateOptimisticCart({ type: "remove", productId });
        try {
          await removeFromCartAction(productId);
          // We don't need to show a toast here because the cart is updated optimistically
          // toast.success("Odstránené z košíka");
        } catch (error) {
          toast.error("Nepodarilo sa odstrániť z košíka");
          // biome-ignore lint/suspicious/noConsole: Error reporting
          console.error(error);
        }
      });
    },
    [updateOptimisticCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      startTransition(async () => {
        updateOptimisticCart({ type: "update", productId, quantity });
        try {
          await updateQuantityAction(productId, quantity);
        } catch (error) {
          toast.error("Nepodarilo sa aktualizovať množstvo");
          // biome-ignore lint/suspicious/noConsole: Error reporting
          console.error(error);
        }
      });
    },
    [updateOptimisticCart]
  );

  const items = optimisticCart?.items ?? [];
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        itemsCount,
        totalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
