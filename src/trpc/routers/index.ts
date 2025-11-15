import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { adminCategoriesRouter } from "./categories";
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
  prices: adminPricesRouter,
  organizations: adminOrganizationsRouter,
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
