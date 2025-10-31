import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { media } from "./media";

type Address = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
  googleId: string;
};

type WorkDay = {
  open: string;
  close: string;
};

type OpeningHours = {
  weekdays: WorkDay;
  saturday: WorkDay;
  sunday: WorkDay;
};

export const stores = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: jsonb("description"),

  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  phone: text("phone"),
  email: text("email"),
  address: jsonb("address").$type<Address>(),

  imageId: text("image_id").references(() => media.id, {
    onDelete: "set null",
  }),
  openingHours: jsonb("opening_hours").$type<OpeningHours>(),

  deletedAt: timestamp("deleted_at"),

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
