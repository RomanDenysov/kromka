import type { JSONContent } from "@tiptap/react";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createPrefixedId } from "@/lib/ids";
import {
  type Address,
  type B2bApplicationStatus,
  DEFAULT_OPENING_HOURS,
  DEFAULT_PAYMENT_TERM_DAYS,
  type InvoiceStatus,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
  type PostStatus,
  type ProductSnapshot,
  type ProductStatus,
  type PromoType,
  type StoreSchedule,
  type UserRole,
} from "./types";
import { draftSlug } from "./utils";

// #region Auth
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
  activeOrganizationId: text("active_organization_id").references(
    () => organizations.id,
    { onDelete: "set null" }
  ),
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

  billingName: text("billing_name"),
  ico: text("ico"),
  dic: text("dic"),
  icDph: text("ic_dph"),
  billingAddress: jsonb("billing_address").$type<Address>(),
  billingEmail: text("billing_email"),
  paymentTermDays: integer("payment_term_days").default(
    DEFAULT_PAYMENT_TERM_DAYS
  ),
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

export const b2bApplications = pgTable(
  "b2b_applications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("b2ba")),
    companyName: text("company_name").notNull(),
    ico: text("ico").notNull(),
    dic: text("dic"),
    icDph: text("ic_dph"),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    billingAddress: jsonb("billing_address").$type<Address>(),
    message: text("message"),
    status: text("status")
      .$type<B2bApplicationStatus>()
      .default("pending")
      .notNull(),
    rejectionReason: text("rejection_reason"),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_b2b_applications_status").on(table.status),
    index("idx_b2b_applications_created_at").on(table.createdAt),
    index("idx_b2b_applications_reviewed_at").on(table.reviewedAt),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  members: many(members),
  invitationsSent: many(invitations, {
    relationName: "inviter",
  }),
  b2bApplicationsReviewed: many(b2bApplications, {
    relationName: "reviewer",
  }),
  orders: many(orders),
  posts: many(posts),
  postComments: many(postComments),
  reviews: many(reviews),
  favorites: many(favorites),
  postLikes: many(postLikes),
  promoCodeUsages: many(promoCodeUsages),
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

export const b2bApplicationsRelations = relations(
  b2bApplications,
  ({ one }) => ({
    reviewer: one(users, {
      fields: [b2bApplications.reviewedBy],
      references: [users.id],
      relationName: "reviewer",
    }),
  })
);

// #endregion Auth

// #region Categories

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

    pickupDates: jsonb("pickup_dates").$type<string[]>(), // e.g. ["2025-12-24", "2025-12-25"] if empty, all days are available

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

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  image: one(media, {
    fields: [categories.imageId],
    references: [media.id],
  }),
  products: many(products),
}));

// #endregion Categories

// #region Media

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
  posts: many(posts),
  products: many(products),
}));

// #endregion Media

// #region Promo codes

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("promo")),
    code: text("code").notNull().unique(),

    type: text("type").$type<PromoType>().notNull(),
    value: integer("value").notNull(), // percentage or cents

    minOrderCents: integer("min_order_cents"), // minimum order amount
    maxUsageCount: integer("max_usage_count"), // maximum usage count
    usageCount: integer("usage_count").default(0).notNull(),

    maxUsagePerUser: integer("max_usage_per_user").default(1),

    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),

    isActive: boolean("is_active").default(true).notNull(),

    // Optional: limit to categories/products
    applicableToProductIds: jsonb("applicable_to_product_ids").$type<
      string[]
    >(),
    applicableToCategoryIds: jsonb("applicable_to_category_ids").$type<
      string[]
    >(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("idx_promo_codes_code").on(table.code)]
);

// Promo code usages
export const promoCodeUsages = pgTable(
  "promo_code_usages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("promo_use")),
    promoCodeId: text("promo_code_id")
      .notNull()
      .references(() => promoCodes.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    discountCents: integer("discount_cents").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_promo_usage_user").on(table.userId),
    index("idx_promo_usage_code").on(table.promoCodeId),
  ]
);

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  orders: many(orders),
  usages: many(promoCodeUsages),
}));

export const promoCodeUsagesRelations = relations(
  promoCodeUsages,
  ({ one }) => ({
    promoCode: one(promoCodes, {
      fields: [promoCodeUsages.promoCodeId],
      references: [promoCodes.id],
    }),
    user: one(users, {
      fields: [promoCodeUsages.userId],
      references: [users.id],
    }),
    order: one(orders, {
      fields: [promoCodeUsages.orderId],
      references: [orders.id],
    }),
  })
);

// #endregion Promo codes

// #region Carts

export const carts = pgTable(
  "carts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("cart")),

    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    shareToken: text("share_token").unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("uniq_cart_user_company").on(table.userId, table.companyId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),

    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.cartId, table.productId] })]
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  company: one(organizations, {
    fields: [carts.companyId],
    references: [organizations.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// #endregion Carts

// #region Orders

export const invoices = pgTable(
  "invoices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("inv")),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id),

    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),

    status: text("status").$type<InvoiceStatus>().default("draft").notNull(),
    totalCents: integer("total_cents").notNull().default(0),

    dueDate: timestamp("due_date"),
    issuedAt: timestamp("issued_at"),
    paidAt: timestamp("paid_at"),

    pdfUrl: text("pdf_url"),
    invoiceNumber: text("invoice_number").unique(), // VS2025001

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_invoices_org_id").on(table.orgId),
    index("idx_invoices_status").on(table.status),
    index("idx_invoices_due_date").on(table.dueDate),
    index("idx_invoices_issued_at").on(table.issuedAt),
    index("idx_invoices_paid_at").on(table.paidAt),
    index("idx_invoices_invoice_number").on(table.invoiceNumber),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ord")),

    orderNumber: text("order_number").unique().notNull(),

    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    customerInfo: jsonb("customer_info").$type<{
      name?: string | null;
      email: string;
      phone: string;
    }>(),

    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),

    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    deliveryAddress: jsonb("delivery_address").$type<Address>(),

    orderStatus: text("order_status")
      .$type<OrderStatus>()
      .default("new")
      .notNull(),

    paymentStatus: text("payment_status")
      .$type<PaymentStatus>()
      .default("pending")
      .notNull(),
    paymentMethod: text("payment_method")
      .$type<PaymentMethod>()
      .default("in_store")
      .notNull(),

    totalCents: integer("total_cents").notNull(),

    pickupDate: date("pickup_date", { mode: "string" }),
    pickupTime: text("pickup_time").notNull(),

    paymentId: text("payment_id"),

    invoiceId: text("invoice_id").references(() => invoices.id, {
      onDelete: "set null",
    }),

    promoCodeId: text("promo_code_id").references(() => promoCodes.id, {
      onDelete: "set null",
    }),
    discountCents: integer("discount_cents").default(0).notNull(),

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
    status: text("status").$type<OrderStatus>().default("new").notNull(),
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
        onDelete: "set null",
      }),
    productSnapshot: jsonb("product_snapshot").$type<ProductSnapshot>(),
    quantity: integer("quantity").notNull().default(1),
    price: integer("price").notNull(),
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
  invoice: one(invoices, {
    fields: [orders.invoiceId],
    references: [invoices.id],
  }),
  promoCode: one(promoCodes, {
    fields: [orders.promoCodeId],
    references: [promoCodes.id],
  }),
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

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.orgId],
    references: [organizations.id],
  }),
  orders: many(orders),
}));

// #endregion Orders

// #region Prices

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
  },
  (table) => [
    primaryKey({
      columns: [table.productId, table.priceTierId],
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

// #endregion Prices

// #region Products

export const products = pgTable(
  "products",
  {
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

    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    imageId: text("image_id").references(() => media.id, {
      onDelete: "set null",
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
  },
  (t) => [
    index("idx_products_slug").on(t.slug),
    index("idx_products_category_id").on(t.categoryId),
    index("idx_products_active_status").on(t.isActive, t.status),
    index("idx_products_sort").on(t.sortOrder, t.createdAt),
  ]
);

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

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  prices: many(prices),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  favorites: many(favorites),
  reviews: many(reviews),
  image: one(media, {
    fields: [products.imageId],
    references: [media.id],
  }),
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

// #endregion Products

// #region Stores

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

export const storesRelations = relations(stores, ({ many, one }) => ({
  image: one(media, {
    fields: [stores.imageId],
    references: [media.id],
  }),
  orders: many(orders),
}));

// #endregion Stores

// #region Blog

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("post")),

    title: text("title").notNull().default("Nový článok"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nový článok")),

    excerpt: text("excerpt"), // short description for preview
    content: jsonb("content").$type<JSONContent>(), // TipTap like in products

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    coverImageId: text("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),

    status: text("status").$type<PostStatus>().default("draft").notNull(),
    publishedAt: timestamp("published_at"),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_posts_slug").on(table.slug),
    index("idx_posts_status").on(table.status),
    index("idx_posts_published_at").on(table.publishedAt),
  ]
);

// Tags for posts
export const postTags = pgTable("post_tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createPrefixedId("tag")),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const postToTags = pgTable(
  "post_to_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => postTags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

// Comments
export const postComments = pgTable(
  "post_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("comment")),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("parent_id"), // for nested comments

    content: text("content").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_comments_post_id").on(table.postId),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
  ]
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  coverImage: one(media, {
    fields: [posts.coverImageId],
    references: [media.id],
  }),
  tags: many(postToTags),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const postTagsRelations = relations(postTags, ({ many }) => ({
  posts: many(postToTags),
}));

export const postToTagsRelations = relations(postToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postToTags.postId],
    references: [posts.id],
  }),
  tag: one(postTags, {
    fields: [postToTags.tagId],
    references: [postTags.id],
  }),
}));

export const postCommentsRelations = relations(
  postComments,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [postComments.postId],
      references: [posts.id],
    }),
    user: one(users, {
      fields: [postComments.userId],
      references: [users.id],
    }),
    parent: one(postComments, {
      fields: [postComments.parentId],
      references: [postComments.id],
      relationName: "parent",
    }),
    replies: many(postComments, {
      relationName: "parent",
    }),
  })
);

// #endregion Blog

// #region Social features

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("rev")),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(), // 1-5
    title: text("title"),
    content: text("content"),

    isVerifiedPurchase: boolean("is_verified_purchase")
      .default(false)
      .notNull(),
    isPublished: boolean("is_published").default(false).notNull(), // moderation

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_reviews_product_id").on(table.productId),
    index("idx_reviews_user_id").on(table.userId),
    // One review per product per user
    // unique([table.userId, table.productId]) if needed
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const postLikes = pgTable(
  "post_likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.postId] }),
    index("idx_post_likes_post_id").on(table.postId),
  ]
);

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

// #endregion Social features

// #region Site settings

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: boolean("value").notNull().default(false),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// #endregion Site settings
