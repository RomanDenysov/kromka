import type { InferInsertModel } from "drizzle-orm";
import type { media } from "./schema/media";

export type InsertMedia = InferInsertModel<typeof media>;
