import z from "zod";

export const productChannelSchema = z.object({
  productId: z.string(),
  channel: z.enum(["B2C", "B2B"]),
  isListed: z.boolean(),
});

export const outputProductChannelSchema = productChannelSchema;

export type ProductChannelSchema = z.infer<typeof productChannelSchema>;
export type OutputProductChannelSchema = z.infer<
  typeof outputProductChannelSchema
>;
