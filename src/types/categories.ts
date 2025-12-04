import type { InferSelectModel } from "drizzle-orm";
import type { categories, products } from "@/db/schema";

export type Category = InferSelectModel<typeof categories>;
export type TableCategory = Category & {
  products: InferSelectModel<typeof products>[];
};
