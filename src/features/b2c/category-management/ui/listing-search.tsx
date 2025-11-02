"use client";

import { debounce } from "nuqs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCategorySearch } from "../hooks/use-category-search";

type ListingSearchProps = {
  className?: string;
};

const SEARCH_DEBOUNCE_DELAY = 300;

export function ListingSearch({ className }: ListingSearchProps) {
  const [categorySearch, setCategorySearch] = useCategorySearch();

  return (
    <div className={cn("w-full border-b p-3", className)}>
      <Input
        className="h-8 w-full"
        onChange={(e) => {
          const newValue = e.target.value;
          // Debounce URL updates when typing, but allow immediate updates for clearing
          setCategorySearch(
            newValue || null,
            newValue === ""
              ? undefined // Immediate update when clearing
              : { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_DELAY) }
          );
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Immediate update on Enter
            setCategorySearch(categorySearch || null);
          }
        }}
        placeholder="Search categories..."
        type="search"
        value={categorySearch ?? ""}
      />
    </div>
  );
}
