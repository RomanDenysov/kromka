import type z from "zod";
import type { addressSchema, storeSchema } from "./validation";

export type StoreSchema = z.infer<typeof storeSchema>;

export type StoreAddressSchema = z.infer<typeof addressSchema>;
