import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("categories_sort_order_idx").on(table.sortOrder),
    index("categories_slug_idx").on(table.slug),
  ]
);

export const categoryAvailabilityWindows = pgTable(
  "category_availability_windows",
  {
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.startDate, table.endDate] }),
    index("category_availability_category_idx").on(table.categoryId),
    index("category_availability_window_idx").on(
      table.startDate,
      table.endDate
    ),
  ]
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index("product_category_sort_idx").on(table.categoryId, table.sortOrder),
  ]
);
