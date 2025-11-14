import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { users } from "./auth";
import { media } from "./media";
import { products } from "./products";

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("cat")),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    parentId: text("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    imageId: text("image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    isVisible: boolean("is_visible").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
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
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("cat-avail")),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("category_availability_category_idx").on(table.categoryId),
    index("category_availability_window_idx").on(
      table.startDate,
      table.endDate
    ),
    check(
      "category_availability_window_check",
      sql`${table.startDate} < ${table.endDate}`
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
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
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

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  availabilityWindows: many(categoryAvailabilityWindows),
  products: many(productCategories),
  image: one(media, {
    fields: [categories.imageId],
    references: [media.id],
  }),
  createdBy: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

export const categoryAvailabilityWindowsRelations = relations(
  categoryAvailabilityWindows,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryAvailabilityWindows.categoryId],
      references: [categories.id],
    }),
    createdBy: one(users, {
      fields: [categoryAvailabilityWindows.createdBy],
      references: [users.id],
    }),
  })
);

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export type Category = typeof categories.$inferSelect;
export type CategoryAvailabilityWindow =
  typeof categoryAvailabilityWindows.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
