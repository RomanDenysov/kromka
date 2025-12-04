import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { publicCartRouter } from "./cart";
import { publicCategoriesRouter } from "./categories";
import { adminMediaRouter } from "./media";
import { adminOrdersRouter } from "./orders";
import { adminOrganizationsRouter } from "./organizations";
import { adminProductsRouter, publicProductsRouter } from "./products";
import { adminStoresRouter, publicStoresRouter } from "./stores";
import { adminUsersRouter, publicUsersRouter } from "./users";

const adminRouter = createTRPCRouter({
  products: adminProductsRouter,
  users: adminUsersRouter,
  media: adminMediaRouter,
  stores: adminStoresRouter,
  organizations: adminOrganizationsRouter,
  orders: adminOrdersRouter,
});

const publicRouter = createTRPCRouter({
  products: publicProductsRouter,
  categories: publicCategoriesRouter,
  cart: publicCartRouter,
  users: publicUsersRouter,
  stores: publicStoresRouter,
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  public: publicRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
