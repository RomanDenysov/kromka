import { cache } from "react";
import { db } from "@/db";

export const getCategories = cache(async () => {
  const categories = await db.query.categories.findMany({
    where: (category, { isNull }) => isNull(category.deletedAt),
  });
  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
});

export const getCategory = cache(
  async (id: string) =>
    await db.query.categories.findFirst({
      where: (category, { and, isNull, eq }) =>
        and(isNull(category.deletedAt), eq(category.id, id)),
    })
);
