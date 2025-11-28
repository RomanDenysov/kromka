import type { InferSelectModel } from "drizzle-orm";
import type { categories } from "@/db/schema";

export type Category = InferSelectModel<typeof categories>;
