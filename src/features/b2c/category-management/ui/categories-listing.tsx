"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSuspenseCategoriesQuery } from "../hooks/use-categories-query";
import { useCategorySearch } from "../hooks/use-category-search";
import { AddCategoryButton } from "./add-category-button";
import { CategoryItem } from "./category-item";

export function CategoriesListing({ className }: { className?: string }) {
  const [searchQuery] = useCategorySearch();
  const { data: categories } = useSuspenseCategoriesQuery();

  const filteredCategories = useMemo(() => {
    const query = (searchQuery ?? "").trim();
    if (!query) {
      return categories;
    }

    const lowerQuery = query.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, categories]);

  return (
    <section
      className={cn(
        "relative flex size-full h-full flex-col overflow-hidden",
        className
      )}
    >
      <ScrollArea className="flex-1 overflow-hidden">
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
      <div className="sticky inset-x-0 bottom-0 border-t bg-background">
        <AddCategoryButton />
      </div>
    </section>
  );
}
