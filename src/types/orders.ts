// Re-export cart types for backward compatibility
export type {
  Cart as Order,
  CartItem,
  CartProduct as OrderProduct,
} from "./cart";

export type OrderStatus =
  | "new"
  | "in_progress"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "refunded";
