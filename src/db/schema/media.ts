import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createPrefixedId } from "@/lib/ids";

export const media = pgTable("media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("med")),
  name: text("name").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull().unique(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
