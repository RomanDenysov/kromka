import type { InferSelectModel } from "drizzle-orm";
import type { categories, media, products } from "@/db/schema";

export type Category = InferSelectModel<typeof categories>;
export type TableCategory = Category & {
  products: InferSelectModel<typeof products>[];
};

export type AdminCategory = Category & {
  products: InferSelectModel<typeof products>[];
  image: InferSelectModel<typeof media> | null;
};
