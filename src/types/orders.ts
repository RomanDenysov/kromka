// Re-export cart types for backward compatibility
export type { Cart as Order, CartItem, CartItems } from "./cart";

export type OrderStatus =
  | "cart"
  | "new"
  | "in_progress"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "refunded";
