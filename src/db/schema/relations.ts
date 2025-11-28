import { relations } from "drizzle-orm/relations";
import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  users,
} from "./auth";
import {
  categories,
  categoryAvailabilityWindows,
  productCategories,
} from "./categories";
import { media } from "./media";
import { orderItems, orderStatusEvents, orders } from "./orders";
import { prices, priceTiers } from "./prices";
import { productImages, products } from "./products";
import { storeMembers, stores } from "./stores";

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

export const mediaRelations = relations(media, ({ many }) => ({
  productImages: many(productImages),
  stores: many(stores),
  categories: many(categories),
}));

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
