import type z from "zod";
import type { storeSchema } from "./validation";

export type StoreSchema = z.infer<typeof storeSchema>;
