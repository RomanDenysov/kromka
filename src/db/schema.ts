import type { JSONContent } from "@tiptap/react";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
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
  heroBanners: many(heroBanners),
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
  (table) => [
    index("idx_promo_codes_code").on(table.code),
    check("promo_codes_value_non_negative", sql`${table.value} >= 0`),
    check(
      "promo_codes_min_order_cents_non_negative",
      sql`${table.minOrderCents} >= 0`
    ),
  ]
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
    check("invoices_total_cents_non_negative", sql`${table.totalCents} >= 0`),
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
    index("orders_company_id_idx").on(table.companyId),
    check("orders_total_cents_non_negative", sql`${table.totalCents} >= 0`),
    check(
      "orders_discount_cents_non_negative",
      sql`${table.discountCents} >= 0`
    ),
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
    // Snapshot of computed cost-per-unit at order creation (Phase C populates this).
    // Nullable: legacy orders + orders for products without a recipe stay null.
    unitCostCents: integer("unit_cost_cents"),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.productId] }),
    check("order_items_price_non_negative", sql`${table.price} >= 0`),
    check(
      "order_items_unit_cost_non_negative",
      sql`${table.unitCostCents} IS NULL OR ${table.unitCostCents} >= 0`
    ),
  ]
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
    check("prices_price_cents_non_negative", sql`${table.priceCents} >= 0`),
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

    // EU 14-allergen codes manually tagged by admin (Phase A).
    // In Phase D, products with a recipe derive allergens from ingredients;
    // this column stays as the fallback for products without a recipe.
    allergenCodes: text("allergen_codes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    // Optional FK to a recipe (Phase C). Phase C derives cost from this
    // recipe at order time; Phase D derives nutrition + allergens.
    // Nullable: products can ship without a recipe (resold packaged items).
    // Defined as plain text + manual FK in a separate file to avoid the
    // circular ref between products and recipes tables.
    recipeId: text("recipe_id"),

    // Phase D: manual nutrition override. When non-null, PDP shows these
    // values verbatim and labels them "manuálne". When null, PDP derives
    // from the recipe (if present) or hides the nutrition section.
    nutritionOverride: jsonb("nutrition_override"),

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
    check("products_price_cents_non_negative", sql`${t.priceCents} >= 0`),
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
  recipe: one(recipes, {
    fields: [products.recipeId],
    references: [recipes.id],
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
    unique("reviews_user_product_unique").on(table.userId, table.productId),
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

// #region Hero banners

export const heroBanners = pgTable(
  "hero_banners",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("hero")),
    name: text("name").notNull(),
    heading: text("heading"),
    subtitle: text("subtitle"),
    imageId: text("image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("hero_banners_active_idx").on(table.isActive)]
);

export const heroBannersRelations = relations(heroBanners, ({ one }) => ({
  image: one(media, {
    fields: [heroBanners.imageId],
    references: [media.id],
  }),
}));

// #endregion Hero banners

// #region Allergens

/**
 * EU 14 mandatory allergens (Regulation 1169/2011 Annex II).
 * Seeded once via migration; the row count must match
 * ALLERGEN_CODES in src/features/allergens/schema.ts.
 *
 * `code` is the primary key — EU identifiers are stable, no need for prefixed CUIDs.
 */
export const allergens = pgTable("allergens", {
  code: text("code").primaryKey(),
  nameSk: text("name_sk").notNull(),
  nameEn: text("name_en").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// #endregion Allergens

// #region Ingredients (Phase B)

export const INGREDIENT_BASE_UNITS = ["g", "piece"] as const;
export type IngredientBaseUnit = (typeof INGREDIENT_BASE_UNITS)[number];

export const INGREDIENT_NUTRITION_SOURCES = [
  "manual",
  "ai",
  "supplier",
  "seed",
] as const;
export type IngredientNutritionSource =
  (typeof INGREDIENT_NUTRITION_SOURCES)[number];

/** Nutrition values per 100 g of the ingredient. EU 1169/2011 fields. */
export interface NutritionPer100 {
  carbs: number;
  fat: number;
  fiber: number;
  kcal: number;
  protein: number;
  salt: number;
  saturatedFat: number;
  sugar: number;
}

/**
 * Raw-material catalog. Pricing uses XOR: cents/kg for mass, cents/piece
 * for piece. See docs/specs/_arc-overview.md §3 for the rationale —
 * per-kg storage is integer-lossless for every realistic supplier price.
 */
export const ingredients = pgTable(
  "ingredients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ing")),
    name: text("name").notNull().default("Nová surovina"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nová surovina")),

    baseUnit: text("base_unit")
      .$type<IngredientBaseUnit>()
      .notNull()
      .default("g"),
    gramsPerPiece: integer("grams_per_piece"),

    pricePerKgCents: integer("price_per_kg_cents"),
    pricePerPieceCents: integer("price_per_piece_cents"),

    supplierName: text("supplier_name"),

    allergenCodes: text("allergen_codes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    nutritionPer100: jsonb("nutrition_per_100").$type<NutritionPer100>(),
    nutritionSource: text("nutrition_source")
      .$type<IngredientNutritionSource>()
      .notNull()
      .default("manual"),

    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_ingredients_slug").on(t.slug),
    index("idx_ingredients_active").on(t.isActive),
    check(
      "ingredients_price_kg_non_negative",
      sql`${t.pricePerKgCents} IS NULL OR ${t.pricePerKgCents} >= 0`
    ),
    check(
      "ingredients_price_piece_non_negative",
      sql`${t.pricePerPieceCents} IS NULL OR ${t.pricePerPieceCents} >= 0`
    ),
    check(
      "ingredients_grams_per_piece_when_piece",
      sql`(${t.baseUnit} <> 'piece') OR (${t.gramsPerPiece} IS NOT NULL AND ${t.gramsPerPiece} > 0)`
    ),
    check(
      "ingredients_price_matches_base_unit",
      sql`(${t.baseUnit} = 'g'     AND ${t.pricePerKgCents}    IS NOT NULL AND ${t.pricePerPieceCents} IS NULL)
       OR (${t.baseUnit} = 'piece' AND ${t.pricePerPieceCents} IS NOT NULL AND ${t.pricePerKgCents}    IS NULL)`
    ),
  ]
);

/** Append-only price-change log. Mirrors the ingredients XOR pricing shape. */
export const ingredientPriceHistory = pgTable(
  "ingredient_price_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("iph")),
    ingredientId: text("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    pricePerKgCents: integer("price_per_kg_cents"),
    pricePerPieceCents: integer("price_per_piece_cents"),
    supplierName: text("supplier_name"),
    source: text("source").default("manual").notNull(),
    notes: text("notes"),
    effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  },
  (t) => [
    index("idx_iph_ingredient_effective").on(t.ingredientId, t.effectiveFrom),
    check(
      "iph_price_kg_non_negative",
      sql`${t.pricePerKgCents}    IS NULL OR ${t.pricePerKgCents}    >= 0`
    ),
    check(
      "iph_price_piece_non_negative",
      sql`${t.pricePerPieceCents} IS NULL OR ${t.pricePerPieceCents} >= 0`
    ),
    check(
      "iph_price_xor",
      sql`(${t.pricePerKgCents}    IS NOT NULL AND ${t.pricePerPieceCents} IS NULL)
       OR (${t.pricePerPieceCents} IS NOT NULL AND ${t.pricePerKgCents}    IS NULL)`
    ),
  ]
);

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  priceHistory: many(ingredientPriceHistory),
}));

export const ingredientPriceHistoryRelations = relations(
  ingredientPriceHistory,
  ({ one }) => ({
    ingredient: one(ingredients, {
      fields: [ingredientPriceHistory.ingredientId],
      references: [ingredients.id],
    }),
  })
);

// #endregion Ingredients

// #region Recipes (Phase C)

export const RECIPE_KINDS = ["product", "sub_recipe"] as const;
export type RecipeKind = (typeof RECIPE_KINDS)[number];

export const RECIPE_STATUSES = ["draft", "published"] as const;
export type RecipeStatus = (typeof RECIPE_STATUSES)[number];

/**
 * Recipe header. Two kinds: 'product' (linked to a product, final SKU)
 * and 'sub_recipe' (reusable BOM building block — kvások, krém, ...).
 *
 * Yield: batch produces N units totalling M grams. Phase D uses
 * batchYieldGrams + yieldLossPercent to derive finished mass for the
 * per-100g nutrition table.
 */
export const recipes = pgTable(
  "recipes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("rec")),
    name: text("name").notNull().default("Nový recept"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nový recept")),
    kind: text("kind").$type<RecipeKind>().notNull().default("product"),
    status: text("status").$type<RecipeStatus>().notNull().default("draft"),
    batchYieldUnits: integer("batch_yield_units").notNull().default(1),
    batchYieldGrams: integer("batch_yield_grams").notNull().default(0),
    yieldLossPercent: integer("yield_loss_percent").notNull().default(10),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_recipes_kind_status").on(t.kind, t.status),
    index("idx_recipes_slug").on(t.slug),
    check("recipes_yield_units_positive", sql`${t.batchYieldUnits} > 0`),
    check("recipes_yield_grams_non_negative", sql`${t.batchYieldGrams} >= 0`),
    check(
      "recipes_loss_percent_range",
      sql`${t.yieldLossPercent} >= 0 AND ${t.yieldLossPercent} <= 50`
    ),
  ]
);

/**
 * Recipe BOM. Each row is exactly one of (ingredientId, subRecipeId).
 * XOR enforced by CHECK; duplicate prevention via unique partial indexes.
 *
 * quantityBaseUnit is in the linked ingredient's base unit (g or pieces)
 * for ingredients, or grams for sub-recipes (consumed by mass).
 */
export const recipeItems = pgTable(
  "recipe_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("rci")),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: text("ingredient_id").references(() => ingredients.id, {
      onDelete: "restrict",
    }),
    subRecipeId: text("sub_recipe_id").references(() => recipes.id, {
      onDelete: "restrict",
    }),
    quantityBaseUnit: integer("quantity_base_unit").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    notes: text("notes"),
  },
  (t) => [
    index("idx_recipe_items_recipe_id").on(t.recipeId, t.sortOrder),
    index("idx_recipe_items_ingredient_id").on(t.ingredientId),
    index("idx_recipe_items_sub_recipe_id").on(t.subRecipeId),
    check(
      "recipe_items_xor_ingredient_or_subrecipe",
      sql`(${t.ingredientId} IS NOT NULL) <> (${t.subRecipeId} IS NOT NULL)`
    ),
    check("recipe_items_quantity_positive", sql`${t.quantityBaseUnit} > 0`),
    check(
      "recipe_items_no_self_reference",
      sql`${t.subRecipeId} IS NULL OR ${t.subRecipeId} <> ${t.recipeId}`
    ),
    unique("recipe_items_unique_ingredient").on(t.recipeId, t.ingredientId),
    unique("recipe_items_unique_subrecipe").on(t.recipeId, t.subRecipeId),
  ]
);

export const recipesRelations = relations(recipes, ({ many, one }) => ({
  items: many(recipeItems, { relationName: "recipe_items" }),
  product: one(products, {
    fields: [recipes.id],
    references: [products.recipeId],
  }),
}));

export const recipeItemsRelations = relations(recipeItems, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeItems.recipeId],
    references: [recipes.id],
    relationName: "recipe_items",
  }),
  ingredient: one(ingredients, {
    fields: [recipeItems.ingredientId],
    references: [ingredients.id],
  }),
  subRecipe: one(recipes, {
    fields: [recipeItems.subRecipeId],
    references: [recipes.id],
  }),
}));

// #endregion Recipes
