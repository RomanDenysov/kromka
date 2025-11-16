import type { InferSelectModel } from "drizzle-orm";
import type { categories } from "@/db/schema/categories";

export type Category = InferSelectModel<typeof categories>;
