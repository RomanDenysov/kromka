// types.ts

// === Statuses ===
export const USER_ROLES = ["admin", "manager", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STORE_MANAGER_ASSIGNMENT_ROLES = ["manager"] as const;
export type StoreManagerAssignmentRole =
  (typeof STORE_MANAGER_ASSIGNMENT_ROLES)[number];

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

export const ALLOWED_B2C_PAYMENT_METHODS: readonly string[] = [
  "in_store",
  "card",
];
export type B2cPaymentMethod = "in_store" | "card";

export function isB2cPaymentMethod(value: string): value is B2cPaymentMethod {
  return ALLOWED_B2C_PAYMENT_METHODS.includes(value);
}

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

export const WEIGHT_UNITS = ["g", "ml", "ks"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const POST_STATUSES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const B2B_APPLICATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type B2bApplicationStatus = (typeof B2B_APPLICATION_STATUSES)[number];

export const PROMO_TYPES = [
  "percentage",
  "fixed_amount",
  "free_shipping",
] as const;
export type PromoType = (typeof PROMO_TYPES)[number];

// === Activity Log ===
/** Who triggered an activity entry. */
export const ACTIVITY_ACTOR_TYPES = ["staff", "customer", "system"] as const;
export type ActivityActorType = (typeof ACTIVITY_ACTOR_TYPES)[number];

/** Domain object an activity entry points at (soft, polymorphic reference). */
export const ACTIVITY_ENTITY_TYPES = [
  "order",
  "product",
  "b2b_application",
  "organization",
  "store",
  "invoice",
  "promo_code",
  "user",
] as const;
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

/** Object.Action event names, matching the analytics naming convention. */
export const ACTIVITY_ACTIONS = [
  "order.created",
  "order.status_changed",
  "order.pickup_updated",
  "order.cancelled",
  "payment.received",
  "product.created",
  "product.updated",
  "product.archived",
  "store.deactivated",
  "b2b_application.submitted",
  "b2b_application.approved",
  "b2b_application.rejected",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/**
 * Display/filter role, derived from `actorType` + whether `actorId` is set:
 * staff (admin/manager), user (registered customer), guest (anonymous
 * customer), system (automated). Not a stored column.
 */
export const ACTIVITY_ROLES = ["staff", "user", "guest", "system"] as const;
export type ActivityRole = (typeof ACTIVITY_ROLES)[number];

// === JSONB Types ===
export interface Address {
  city?: string;
  country?: string;
  googleId?: string;
  postalCode?: string;
  street?: string;
}

export interface TimeRange {
  end: string;
  start: string;
}

export type DaySchedule = TimeRange | "closed" | null;

export interface StoreSchedule {
  exceptions?: Record<string, DaySchedule>;
  regularHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
}

export interface ProductSnapshot {
  basePriceCents: number;
  categoryName: string | null;
  effectivePriceCents: number;
  name: string;
  price: number;
}

/** Extra context stored on an activity_log entry (all optional). */
export interface ActivityMetadata {
  /** Monetary amount in cents (e.g. payment received). */
  amountCents?: number | null;
  /** Shared id across entries from one bulk action; the feed collapses them. */
  batchId?: string | null;
  /** Display suffix shown after "·" in the feed (store, gateway, client...). */
  context?: string | null;
  /** Previous value, e.g. old order status. */
  from?: string | null;
  /** Free-text note (e.g. cancellation reason). */
  note?: string | null;
  /** New value, e.g. new order status. */
  to?: string | null;
  [key: string]: unknown;
}

// === Order Status Subsets ===
/** Statuses where users can still modify their orders (cancel, change pickup) */
export const MODIFIABLE_ORDER_STATUSES: OrderStatus[] = ["new", "in_progress"];

/** Statuses where admin/manager can modify pickup details */
export const ADMIN_MODIFIABLE_PICKUP_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "ready_for_pickup",
];

/** Terminal statuses - orders that are no longer active */
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "completed",
  "cancelled",
  "refunded",
];

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
