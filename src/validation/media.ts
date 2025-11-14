import z from "zod";

export const mediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.number(),
});

export type MediaSchema = z.infer<typeof mediaSchema>;
