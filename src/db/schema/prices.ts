import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createPrefixedId } from "@/lib/ids";
import { organizations } from "./auth";
import { channelEnum } from "./enums";
import { products } from "./products";

export const prices = pgTable(
  "prices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("pri")),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    channel: channelEnum("channel").notNull(),
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
  },
  (table) => [
    // Unique constraint: productId + channel + orgId (nullable) + minQty + startsAt + endsAt + priority
    // PostgreSQL treats NULLs specially in unique indexes - multiple NULLs are allowed
    // This means B2C prices (orgId=NULL) can have duplicates, but B2B prices (orgId set) are unique
    // Note: For stricter B2C uniqueness, consider making orgId required and using a sentinel value
    uniqueIndex("uniq_prices_product_channel_org_qty_window_priority").on(
      table.productId,
      table.channel,
      table.orgId,
      table.minQty,
      table.startsAt,
      table.endsAt,
      table.priority
    ),
  ]
);

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  organization: one(organizations, {
    fields: [prices.orgId],
    references: [organizations.id],
  }),
}));

export const insertPriceSchema = createInsertSchema(prices);
export const updatePriceSchema = createUpdateSchema(prices);
