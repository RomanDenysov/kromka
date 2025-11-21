import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { organizations, users } from "./auth";
import { products } from "./products";
import { stores } from "./stores";

type ProductSnapshot = {
  name: string;
  price: number;
};

export const PAYMENT_METHODS = [
  "in_store",
  "card",
  "invoice",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = [
  "cart",
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

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "paid",
  "void",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ord")),
    orderNumber: text("order_number").unique(),

    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    orderStatus: text("order_status")
      .$type<OrderStatus>()
      .default("cart")
      .notNull(),

    paymentStatus: text("payment_status")
      .$type<PaymentStatus>()
      .default("pending")
      .notNull(),
    paymentMethod: text("payment_method")
      .$type<PaymentMethod>()
      .default("in_store")
      .notNull(),

    totalCents: integer("total_cents"),

    pickupDate: timestamp("pickup_date"),
    pickupTime: time("pickup_time"),

    paymentId: text("payment_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_created_by_store_id").on(table.createdBy, table.storeId),
    index("idx_order_status").on(table.orderStatus),
    index("idx_payment_status").on(table.paymentStatus),
    index("idx_payment_method").on(table.paymentMethod),
    index("idx_pickup_date").on(table.pickupDate),
    index("idx_created_at").on(table.createdAt),
  ]
);

export type SelectOrder = typeof orders.$inferSelect;

export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("inv")),
  orgId: text("org_id").references(() => organizations.id),
  status: text("status").$type<InvoiceStatus>().default("draft").notNull(),
  totalCents: integer("total_cents").notNull(),
  dueDate: timestamp("due_date"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const orderStatusEvents = pgTable(
  "order_status_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ose")),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status").$type<OrderStatus>().default("cart").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_order_status_event_order_id").on(t.orderId)]
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

export const ordersRelations = relations(orders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  company: one(organizations, {
    fields: [orders.companyId],
    references: [organizations.id],
  }),
  items: many(orderItems),
  statusEvents: many(orderStatusEvents),
}));

export const orderStatusEventsRelations = relations(
  orderStatusEvents,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusEvents.orderId],
      references: [orders.id],
    }),
    createdBy: one(users, {
      fields: [orderStatusEvents.createdBy],
      references: [users.id],
    }),
  })
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
