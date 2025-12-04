import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { publicCartRouter } from "./cart";
import { adminMediaRouter } from "./media";
import { adminOrdersRouter } from "./orders";
import { publicProductsRouter } from "./products";

const adminRouter = createTRPCRouter({
  media: adminMediaRouter,
  orders: adminOrdersRouter,
});

const publicRouter = createTRPCRouter({
  products: publicProductsRouter,
  cart: publicCartRouter,
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  public: publicRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
