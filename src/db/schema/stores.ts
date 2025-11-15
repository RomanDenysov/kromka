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
import { users } from "./auth";
import { media } from "./media";
import { orders } from "./orders";

type Address = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
  googleId: string;
};

type TimeSlot = {
  open: string;
  close: string;
};

type DaySchedule = {
  period: TimeSlot | null;
  isClosed: boolean;
};

type OpeningHours = {
  weekdays: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export const stores = pgTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("sto")),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: jsonb("description").$type<JSONContent>().notNull(),

  isActive: boolean("is_active").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: jsonb("address").$type<Address>().notNull(),

  imageId: text("image_id").references(() => media.id, {
    onDelete: "set null",
  }),
  openingHours: jsonb("opening_hours").$type<OpeningHours>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const storeMembers = pgTable(
  "store_members",
  {
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.storeId, table.userId] })]
);

export const storesRelations = relations(stores, ({ many, one }) => ({
  image: one(media, {
    fields: [stores.imageId],
    references: [media.id],
  }),
  members: many(storeMembers),
  orders: many(orders),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
  store: one(stores, {
    fields: [storeMembers.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeMembers.userId],
    references: [users.id],
  }),
}));
