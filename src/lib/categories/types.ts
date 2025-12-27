import type z from "zod";
import type { categorySchema } from "./validation";

export type CategorySchema = z.infer<typeof categorySchema>;
