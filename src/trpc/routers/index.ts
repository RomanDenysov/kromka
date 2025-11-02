import { createTRPCRouter } from "../init";
import { adminCategoriesRouter } from "./categories";
import { adminProductsRouter } from "./products";

const adminRouter = createTRPCRouter({
  products: adminProductsRouter,
  categories: adminCategoriesRouter,
});

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
