import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import type { Category } from "@/lib/queries/categories";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  parentId: z.string().nullable(),
  showInMenu: z.boolean(),
  isActive: z.boolean(),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  imageId: z.string().nullable(),
  sortOrder: z.number(),
  pickupDates: z.array(z.string()).optional(),
});

export type CategorySchema = z.infer<typeof categorySchema>;

export function useCategoryForm(category: Category) {
  return useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category.id,
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      parentId: category.parentId ?? null,
      pickupDates: category.pickupDates ?? [],
      isActive: category.isActive ?? false,
      showInMenu: category.showInMenu ?? true,
      showInB2c: category.showInB2c ?? true,
      showInB2b: category.showInB2b ?? true,
      imageId: category.imageId ?? null,
      sortOrder: category.sortOrder ?? 0,
    },
  });
}
