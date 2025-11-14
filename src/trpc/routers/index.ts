import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { adminCategoriesRouter } from "./categories";
import { adminDeliveriesRouter } from "./deliveries";
import { adminInvoicesRouter } from "./invoices";
import { adminMediaRouter } from "./media";
import { adminOrdersRouter } from "./orders";
import { adminOrganizationsRouter } from "./organizations";
import { adminPricesRouter } from "./prices";
import { adminProductChannelsRouter } from "./product-channels";
import { adminProductsRouter } from "./products";
import { publicPricesRouter } from "./public/prices";
import { publicProductChannelsRouter } from "./public/product-channels";
import { adminStoresRouter } from "./stores";
import { adminUsersRouter } from "./users";

const adminRouter = createTRPCRouter({
  products: adminProductsRouter,
  categories: adminCategoriesRouter,
  users: adminUsersRouter,
  media: adminMediaRouter,
  stores: adminStoresRouter,
  orders: adminOrdersRouter,
  invoices: adminInvoicesRouter,
  prices: adminPricesRouter,
  organizations: adminOrganizationsRouter,
  deliveries: adminDeliveriesRouter,
  productChannels: adminProductChannelsRouter,
});

const publicRouter = createTRPCRouter({
  productChannels: publicProductChannelsRouter,
  prices: publicPricesRouter,
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  public: publicRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
