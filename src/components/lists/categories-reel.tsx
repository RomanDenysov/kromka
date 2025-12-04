import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { FilterCarousel } from "./filter-carousel";

export async function CategoriesReel() {
  const categories = await db.query.categories.findMany({
    where: (category, { eq, and }) =>
      and(
        eq(category.isActive, true),
        eq(category.showInMenu, true),
        eq(category.isFeatured, false)
      ),
  });
  return (
    <Suspense fallback={<CategoriesReelSkeleton />}>
      <FilterCarousel
        data={categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
      />
    </Suspense>
  );
}

export function CategoriesReelSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 py-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          className="h-8 w-24 rounded-full"
          key={`skeleton-${i.toString()}`}
        />
      ))}
    </div>
  );
}
