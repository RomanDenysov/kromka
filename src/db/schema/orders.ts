import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { products } from "./products";
import { stores } from "./stores";

const orderStatuses = [
  "cart",
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
] as const;

const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

const paymentMethods = [
  "cash",
  "card_dotypay", // dotykacka dotypay
  "bank_transfer", // by invoice
  "other", // other payment methods
] as const;

type PaymentStatus = (typeof paymentStatuses)[number];
type OrderStatus = (typeof orderStatuses)[number];
type PaymentMethod = (typeof paymentMethods)[number];

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address?: string;
};

type ProductSnapshot = {
  sku: string;
  name: string;
  price: number;
};

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),

    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    customerInfo: jsonb("customer_info").$type<CustomerInfo>(),

    status: text("status").notNull().$type<OrderStatus>().default("cart"),

    subtotal: integer("subtotal"),
    tax: integer("tax"),
    shipping: integer("shipping"),
    total: integer("total"),
    discount: integer("discount"),

    paymentMethod: text("payment_method")
      .notNull()
      .$type<PaymentMethod>()
      .default("cash"),
    paymentStatus: text("payment_status")
      .notNull()
      .$type<PaymentStatus>()
      .default("pending"),

    pickupDate: timestamp("pickup_date").notNull(),

    customerNotes: text("customer_notes"),
    staffNotes: text("staff_notes"),

    readyAt: timestamp("ready_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_user_store_id").on(table.userId, table.storeId),
    index("idx_status").on(table.status),
    index("idx_payment_status").on(table.paymentStatus),
    index("idx_payment_method").on(table.paymentMethod),
    index("idx_pickup_date").on(table.pickupDate),
    index("idx_ready_at").on(table.readyAt),
    index("idx_completed_at").on(table.completedAt),
    index("idx_created_at").on(table.createdAt),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    productSnapshot: jsonb("product_snapshot").$type<ProductSnapshot>(),
    quantity: integer("quantity").notNull().default(1),
    price: integer("price").notNull(),
    total: integer("total").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.orderId, table.productId] })]
);
