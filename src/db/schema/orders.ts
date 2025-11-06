import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createPrefixedId } from "@/lib/ids";
import { organizations, users } from "./auth";
import {
  channelEnum,
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums";
import { products } from "./products";
import { stores } from "./stores";

type ProductSnapshot = {
  sku: string;
  name: string;
  price: number;
};

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ord")),
    orderNumber: text("order_number").notNull().unique(),

    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    channel: channelEnum("channel").notNull().default("B2C"),

    currentStatus: orderStatusEnum("current_status").notNull().default("cart"),
    totalCents: integer("total_cents"),

    pickupDate: timestamp("pickup_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_user_store_id").on(table.userId, table.storeId),
    index("idx_current_status").on(table.currentStatus),
    index("idx_channel").on(table.channel),
    index("idx_pickup_date").on(table.pickupDate),
    index("idx_created_at").on(table.createdAt),
  ]
);

export const orderStatusEvents = pgTable(
  "order_status_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ose")),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_order_status_event_order_id").on(t.orderId),
    index("idx_order_status_event_created_by").on(t.createdBy),
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

export const orderPayments = pgTable(
  "order_payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("pay")),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: paymentMethodEnum("method").notNull(), // cash, card_dotypay, ...
    status: paymentStatusEnum("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(), // add DB CHECK = 'EUR'
    provider: text("provider"), // "dotypay", "bank_transfer", ...
    providerPaymentId: text("provider_payment_id"),
    authorizedAt: timestamp("authorized_at"),
    capturedAt: timestamp("captured_at"),
    failedAt: timestamp("failed_at"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_pay_order").on(t.orderId),
    index("idx_pay_status").on(t.status),
  ]
);

export const paymentRefunds = pgTable(
  "payment_refunds",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ref")),
    paymentId: text("payment_id")
      .notNull()
      .references(() => orderPayments.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_ref_payment").on(t.paymentId)]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
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
  payments: many(orderPayments),
}));

export const orderStatusEventsRelations = relations(
  orderStatusEvents,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusEvents.orderId],
      references: [orders.id],
    }),
    author: one(users, {
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

export const orderPaymentsRelations = relations(
  orderPayments,
  ({ one, many }) => ({
    order: one(orders, {
      fields: [orderPayments.orderId],
      references: [orders.id],
    }),
    refunds: many(paymentRefunds),
  })
);

export const insertOrderSchema = createInsertSchema(orders);
export const updateOrderSchema = createUpdateSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const updateOrderItemSchema = createUpdateSchema(orderItems);

export const insertOrderPaymentSchema = createInsertSchema(orderPayments);
export const updateOrderPaymentSchema = createUpdateSchema(orderPayments);

export const insertPaymentRefundSchema = createInsertSchema(paymentRefunds);
export const updatePaymentRefundSchema = createUpdateSchema(paymentRefunds);
