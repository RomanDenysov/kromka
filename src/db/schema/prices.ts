import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { products } from "./products";

export const priceTiers = pgTable("price_tiers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("pri_tier")),
  name: text("name").notNull().default("Nová cenová skupina"),
  description: text("description").default("Popis vašej cenovej skupiny..."),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const prices = pgTable(
  "prices",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    priceTierId: text("price_tier_id")
      .notNull()
      .references(() => priceTiers.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull().default(0),

    minQty: integer("min_qty").default(1).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.productId, table.priceTierId, table.minQty],
    }),
  ]
);

export const priceTiersRelations = relations(priceTiers, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  priceTier: one(priceTiers, {
    fields: [prices.priceTierId],
    references: [priceTiers.id],
  }),
}));
