// types.ts

// === Statuses ===
export const USER_ROLES = ["admin", "manager", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "in_store",
  "card",
  "invoice",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "paid",
  "void",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PRODUCT_STATUSES = [
  "draft",
  "active",
  "sold",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const POST_STATUSES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const PROMO_TYPES = [
  "percentage",
  "fixed_amount",
  "free_shipping",
] as const;
export type PromoType = (typeof PROMO_TYPES)[number];

// === JSONB Types ===
export type Address = {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  googleId?: string;
};

export type TimeRange = {
  start: string;
  end: string;
};

export type DaySchedule = TimeRange | "closed" | null;

export type StoreSchedule = {
  regularHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  exceptions?: Record<string, DaySchedule>;
};

export type ProductSnapshot = {
  name: string;
  price: number;
};

// === Constants ===
export const DEFAULT_PAYMENT_TERM_DAYS = 14;

export const DEFAULT_OPENING_HOURS: StoreSchedule = {
  regularHours: {
    monday: "closed",
    tuesday: "closed",
    wednesday: "closed",
    thursday: "closed",
    friday: "closed",
    saturday: "closed",
    sunday: "closed",
  },
  exceptions: {},
};
