import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./auth";
import { products } from "./products";

export const prices = pgTable("prices", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  currency: text("currency").notNull(),
  amountCents: integer("amount_cents").notNull(),
  minQty: integer("min_qty").default(1).notNull(),
  priority: integer("priority").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
