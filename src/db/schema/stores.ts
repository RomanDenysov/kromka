import type { JSONContent } from "@tiptap/react";
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
import { users } from "./auth";
import { media } from "./media";

type Address = {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  googleId?: string;
};

type TimeRange = {
  start: string; // "08:00"
  end: string; // "18:00"
};

type DaySchedule = TimeRange | "closed" | null;

export type StoreSchedule = {
  regularHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  exceptions?: {
    [date: string]: DaySchedule; // "2024-12-24": { start: "08:00", end: "12:00" } | "closed"
  };
};

const DEFAULT_OPENING_HOURS: StoreSchedule = {
  regularHours: {
    monday: "closed",
    tuesday: "closed",
    wednesday: "closed",
    thursday: "closed",
    friday: "closed",
    saturday: "closed",
    sunday: "closed",
  },
  exceptions: {},
};

export const stores = pgTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("sto")),
  name: text("name").notNull().default("Nova predajňa"),
  slug: text("slug")
    .notNull()
    .unique()
    .$defaultFn(() => draftSlug("Nova predajňa")),
  description: jsonb("description")
    .$type<JSONContent>()
    .default({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Popis novej predajne..." }],
        },
      ],
    }),

  isActive: boolean("is_active").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  phone: text("phone"),
  email: text("email"),
  address: jsonb("address").$type<Address>().default({
    street: "",
    postalCode: "",
    city: "",
    country: "",
    googleId: "",
  }),

  latitude: text("latitude"),
  longitude: text("longitude"),

  imageId: text("image_id").references(() => media.id, {
    onDelete: "set null",
  }),

  openingHours: jsonb("opening_hours")
    .$type<StoreSchedule | null>()
    .default(DEFAULT_OPENING_HOURS),

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
