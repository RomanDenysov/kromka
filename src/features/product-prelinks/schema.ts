import z from "zod";
import { MAX_STRING_LENGTH } from "@/lib/constants";

const MAX_LABEL_LENGTH = 60;

export const addPrelinkSchema = z.object({
  productId: z.string().min(1).max(MAX_STRING_LENGTH),
  linkedProductId: z.string().min(1).max(MAX_STRING_LENGTH),
  label: z.string().max(MAX_LABEL_LENGTH).nullable().optional(),
});

export const updatePrelinkSchema = z.object({
  productId: z.string().min(1).max(MAX_STRING_LENGTH),
  linkedProductId: z.string().min(1).max(MAX_STRING_LENGTH),
  label: z.string().max(MAX_LABEL_LENGTH).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const removePrelinkSchema = z.object({
  productId: z.string().min(1).max(MAX_STRING_LENGTH),
  linkedProductId: z.string().min(1).max(MAX_STRING_LENGTH),
});

export type AddPrelinkSchema = z.infer<typeof addPrelinkSchema>;
export type UpdatePrelinkSchema = z.infer<typeof updatePrelinkSchema>;
export type RemovePrelinkSchema = z.infer<typeof removePrelinkSchema>;
