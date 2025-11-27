"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEshopParams } from "@/hooks/use-eshop-params";
import { useTRPC } from "@/trpc/client";
import { FilterCarousel } from "./filter-carousel";

export function CategoriesReel() {
  const trpc = useTRPC();
  const { category: categoryId, setParams } = useEshopParams();

  const { data: categories, isLoading: isLoadingCategories } = useSuspenseQuery(
    trpc.public.categories.list.queryOptions()
  );

  if (!categories?.length) {
    return null;
  }

  return (
    <FilterCarousel
      data={categories.map((category) => ({
        value: category.id,
        label: category.name,
      }))}
      isLoading={isLoadingCategories}
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
