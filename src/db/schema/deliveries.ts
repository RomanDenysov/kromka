import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { orders } from "./orders";

type DeliveryAddress = {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  contactName?: string;
  contactPhone?: string;
};

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "scheduled",
  "out_for_delivery",
  "delivered",
  "failed",
  "cancelled",
]);

export const deliveries = pgTable(
  "deliveries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("del")),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    windowStart: timestamp("window_start"),
    windowEnd: timestamp("window_end"),
    address: jsonb("address").$type<DeliveryAddress>(),
    status: deliveryStatusEnum("status").notNull().default("scheduled"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("idx_del_status").on(t.status)]
);
