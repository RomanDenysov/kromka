import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { media } from "./media";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  description: jsonb("description"),
  stock: integer("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status").notNull(),
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
  (table) => [primaryKey({ columns: [table.productId, table.mediaId] })]
);
