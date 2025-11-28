import type { InferInsertModel } from "drizzle-orm";
import type { media } from "@/db/schema";

export type InsertMedia = InferInsertModel<typeof media>;
