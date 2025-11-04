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
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createPrefixedId } from "@/lib/ids";
import { productCategories } from "./categories";
import { productStatusEnum } from "./enums";
import { invoiceItems } from "./invoices";
import { media } from "./media";
import { orderItems } from "./orders";
import { prices } from "./prices";
import { productChannels } from "./product-channels";

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("prod")),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  description: jsonb("description"),
  stock: integer("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),
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
  channels: many(productChannels),
  prices: many(prices),
  orderItems: many(orderItems),
  invoiceItems: many(invoiceItems),
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

export const insertProductSchema = createInsertSchema(products);
export const updateProductSchema = createUpdateSchema(products);

export const insertProductImageSchema = createInsertSchema(productImages);
export const updateProductImageSchema = createUpdateSchema(productImages);
