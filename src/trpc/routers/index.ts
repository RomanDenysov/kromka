import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { adminCategoriesRouter } from "./categories";
import { adminMediaRouter } from "./media";
import { adminProductsRouter } from "./products";
import { adminStoresRouter } from "./stores";
import { adminUsersRouter } from "./users";

const adminRouter = createTRPCRouter({
  products: adminProductsRouter,
  categories: adminCategoriesRouter,
  users: adminUsersRouter,
  media: adminMediaRouter,
  stores: adminStoresRouter,
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
