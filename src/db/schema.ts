import type { JSONContent } from "@tiptap/react";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createPrefixedId } from "@/lib/ids";
import { draftSlug } from "./utils";

// # Auth region

export const USER_ROLES = ["admin", "manager", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phone: text("phone"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isAnonymous: boolean("is_anonymous"),
  role: text("role").$type<UserRole>().default("user").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  activeOrganizationId: text("active_organization_id"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  priceTierId: text("price_tier_id").references(() => priceTiers.id, {
    onDelete: "set null",
  }),
});

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  members: many(members),
  invitationsSent: many(invitations, {
    relationName: "inviter",
  }),
  storeMembers: many(storeMembers),
  orders: many(orders),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    members: many(members),
    invitations: many(invitations),
    orders: many(orders),
    priceTier: one(priceTiers, {
      fields: [organizations.priceTierId],
      references: [priceTiers.id],
    }),
    activeSessions: many(sessions),
  })
);

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
    relationName: "inviter",
  }),
}));

// # end region Auth

// # Categories region

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("cat")),
    name: text("name").notNull().default("Nová kategória"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nová kategória")),
    description: text("description")
      .notNull()
      .default("Popis vašej kategórie..."),

    parentId: text("parent_id"),

    showInMenu: boolean("show_in_menu").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    imageId: text("image_id").references(() => media.id, {
      onDelete: "set null",
    }),

    showInB2c: boolean("show_in_b2c").default(true).notNull(),
    showInB2b: boolean("show_in_b2b").default(true).notNull(),

    isFeatured: boolean("is_featured").default(false).notNull(),

    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("categories_sort_order_idx").on(table.sortOrder),
    index("categories_slug_idx").on(table.slug),

    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("set null"),
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

export const categoriesRelations = relations(categories, ({ many }) => ({
  availabilityWindows: many(categoryAvailabilityWindows),
  products: many(productCategories),
}));

export const categoryAvailabilityWindowsRelations = relations(
  categoryAvailabilityWindows,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryAvailabilityWindows.categoryId],
      references: [categories.id],
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

// # end region Categories

// # Media region

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

export const mediaRelations = relations(media, ({ many }) => ({
  productImages: many(productImages),
  stores: many(stores),
  categories: many(categories),
}));

// # end region Media

// # Orders region

type ProductSnapshot = {
  name: string;
  price: number;
};

export const PAYMENT_METHODS = [
  "in_store",
  "card",
  "invoice",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = [
  "cart",
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "paid",
  "void",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ord")),
    orderNumber: text("order_number").unique(),

    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    orderStatus: text("order_status")
      .$type<OrderStatus>()
      .default("cart")
      .notNull(),

    paymentStatus: text("payment_status")
      .$type<PaymentStatus>()
      .default("pending")
      .notNull(),
    paymentMethod: text("payment_method")
      .$type<PaymentMethod>()
      .default("in_store")
      .notNull(),

    totalCents: integer("total_cents"),

    pickupDate: timestamp("pickup_date"),
    pickupTime: time("pickup_time"),

    paymentId: text("payment_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_created_by_store_id").on(table.createdBy, table.storeId),
    index("idx_order_status").on(table.orderStatus),
    index("idx_payment_status").on(table.paymentStatus),
    index("idx_payment_method").on(table.paymentMethod),
    index("idx_pickup_date").on(table.pickupDate),
    index("idx_created_at").on(table.createdAt),
  ]
);

export type SelectOrder = typeof orders.$inferSelect;

export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("inv")),
  orgId: text("org_id").references(() => organizations.id),
  status: text("status").$type<InvoiceStatus>().default("draft").notNull(),
  totalCents: integer("total_cents").notNull(),
  dueDate: timestamp("due_date"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const orderStatusEvents = pgTable(
  "order_status_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ose")),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status").$type<OrderStatus>().default("cart").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_order_status_event_order_id").on(t.orderId)]
);

export const orderItems = pgTable(
  "order_items",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    productSnapshot: jsonb("product_snapshot").$type<ProductSnapshot>(),
    quantity: integer("quantity").notNull().default(1),
    price: integer("price").notNull(),
    total: integer("total").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.orderId, table.productId] })]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  company: one(organizations, {
    fields: [orders.companyId],
    references: [organizations.id],
  }),
  items: many(orderItems),
  statusEvents: many(orderStatusEvents),
}));

export const orderStatusEventsRelations = relations(
  orderStatusEvents,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusEvents.orderId],
      references: [orders.id],
    }),
    createdBy: one(users, {
      fields: [orderStatusEvents.createdBy],
      references: [users.id],
    }),
  })
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// # end region Orders

// # Prices region

export const priceTiers = pgTable("price_tiers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("pri_tier")),
  name: text("name").notNull().default("Nová cenová skupina"),
  description: text("description").default("Popis vašej cenovej skupiny..."),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const prices = pgTable(
  "prices",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    priceTierId: text("price_tier_id")
      .notNull()
      .references(() => priceTiers.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull().default(0),

    minQty: integer("min_qty").default(1).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.productId, table.priceTierId, table.minQty],
    }),
  ]
);

export const priceTiersRelations = relations(priceTiers, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  priceTier: one(priceTiers, {
    fields: [prices.priceTierId],
    references: [priceTiers.id],
  }),
}));

// # end region Prices

// # Products region

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
  showInB2b: boolean("show_in_b2b").default(false).notNull(),

  isActive: boolean("is_active").default(true).notNull(),
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
    sortOrder: integer("sort_order").default(0).notNull(),
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

// # end region Products

// # Stores region

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

// # end region Stores
