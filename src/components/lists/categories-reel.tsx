"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEshopParams } from "@/hooks/use-eshop-params";
import type { Category } from "@/types/categories";
import { FilterCarousel } from "./filter-carousel";

export function CategoriesReel({ categories }: { categories: Category[] }) {
  const { category: categoryId, setParams } = useEshopParams();

  if (!categories?.length) {
    return null;
  }

  return (
    <FilterCarousel
      data={categories.map((category) => ({
        value: category.id,
        label: category.name,
      }))}
      onSelect={(value) => setParams({ category: value })}
      value={categoryId}
    />
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
