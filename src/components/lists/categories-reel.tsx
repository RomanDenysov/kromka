"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEshopParams } from "@/hooks/use-eshop-params";
import { useTRPC } from "@/trpc/client";

export function CategoriesReel() {
  const trpc = useTRPC();
  const { category: categoryId, setParams } = useEshopParams();

  const { data: categories } = useSuspenseQuery(
    trpc.public.categories.list.queryOptions()
  );

  if (!categories?.length) {
    return null;
  }

  return (
    <div className="group relative w-full">
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-linear-to-l from-background to-transparent" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth">
        <Button
          className="h-8 whitespace-nowrap rounded-full"
          onClick={() => setParams({ category: null })}
          size="sm"
          variant={categoryId === null ? "default" : "secondary"}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            className="h-8 whitespace-nowrap rounded-full"
            key={category.id}
            onClick={() => setParams({ category: category.id })}
            size="sm"
            variant={categoryId === category.id ? "default" : "secondary"}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
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
