import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";
import { users } from "./auth";
import { productImages } from "./products";
import { stores } from "./stores";

export const media = pgTable("media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("med")),
  name: text("name").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull().unique(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const mediaRelations = relations(media, ({ many, one }) => ({
  productImages: many(productImages),
  stores: many(stores),
  createdBy: one(users, {
    fields: [media.createdBy],
    references: [users.id],
  }),
}));
