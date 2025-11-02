"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useCategorySearch } from "../hooks/use-category-search";
import { AddCategoryButton } from "./add-category-button";
import { CategoryItem } from "./category-item";

export function CategoriesListing({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  const [searchQuery] = useCategorySearch();

  const filteredCategories = useMemo(() => {
    const query = (searchQuery ?? "").trim();
    if (!query) {
      return categories;
    }

    const lowerQuery = query.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(lowerQuery)
    );
  }, [categories, searchQuery]);

  return (
    <section
      className={cn(
        "relative flex size-full h-full flex-col overflow-hidden",
        className
      )}
    >
      <ScrollArea className="flex-1 overflow-hidden p-3">
        <div className="flex flex-col gap-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryItem category={category} key={category.id} />
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No categories found
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="sticky inset-x-0 bottom-0 border-t bg-background p-2">
        <AddCategoryButton />
      </div>
    </section>
  );
}
