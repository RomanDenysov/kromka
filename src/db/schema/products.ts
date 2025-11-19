import type { JSONContent } from "@tiptap/react";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { draftSlug } from "../utils";
import { productCategories } from "./categories";
import { media } from "./media";
import { orderItems } from "./orders";
import { prices } from "./prices";

export const PRODUCT_STATUSES = [
  "draft",
  "active",
  "sold",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("prod")),
  name: text("name").notNull().default("Nový produkt"),
  slug: text("slug")
    .notNull()
    .unique()
    .$defaultFn(() => draftSlug("Nový produkt")),
  description: jsonb("description")
    .$type<JSONContent>()
    .default({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Popis nového produktu..." }],
        },
      ],
    }),

  priceCents: integer("price_cents").notNull().default(0),

  showInB2c: boolean("show_in_b2c").default(true).notNull(),
  showInB2b: boolean("show_in_b2b").default(true).notNull(),

  stock: integer("stock"),
  isActive: boolean("is_active").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status").$type<ProductStatus>().default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const productImages = pgTable(
  "product_images",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: text("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    alt: text("alt"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.mediaId] }),
    // Note: Enforce "only one primary image per product" at application level
    // or via database trigger/constraint. Drizzle doesn't support partial unique indexes.
  ]
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  categories: many(productCategories),
  prices: many(prices),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  media: one(media, {
    fields: [productImages.mediaId],
    references: [media.id],
  }),
}));
