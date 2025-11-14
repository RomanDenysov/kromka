import z from "zod";
import { channelEnumSchema } from "@/db/schema/enums-zod";

export const productChannelSchema = z.object({
  productId: z.string(),
  channel: channelEnumSchema,
  isListed: z.boolean(),
});

export const outputProductChannelSchema = productChannelSchema;

export type ProductChannelSchema = z.infer<typeof productChannelSchema>;
export type OutputProductChannelSchema = z.infer<
  typeof outputProductChannelSchema
>;
