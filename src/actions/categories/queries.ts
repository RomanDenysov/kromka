import { cache } from "react";
import { db } from "@/db";

export const getCategories = cache(async () => {
  const categories = await db.query.categories.findMany({
    where: (category, { isNull }) => isNull(category.deletedAt),
    orderBy: (category, { asc, desc }) => [
      asc(category.sortOrder),
      desc(category.createdAt),
    ],
  });
  return categories;
});

export const getCategory = cache(
  async (id: string) =>
    await db.query.categories.findFirst({
      where: (category, { and, isNull, eq }) =>
        and(isNull(category.deletedAt), eq(category.id, id)),
    })
);
