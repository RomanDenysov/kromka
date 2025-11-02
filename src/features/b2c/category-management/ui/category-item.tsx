"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";

export function CategoryItem({ category }: { category: Category }) {
  const [selectedCategoryId, setSelectedCategoryId] = useQueryState(
    "categoryId",
    parseAsString
  );

  const isSelected = selectedCategoryId === category.id;

  const handleClick = () => {
    setSelectedCategoryId(isSelected ? null : category.id);
  };

  return (
    <button
      className={cn(
        "w-full min-w-30 cursor-pointer rounded-md border p-4 text-left transition-colors",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={handleClick}
      type="button"
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{category.name}</div>
        {/* <Button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Handle category actions
          }}
          size="icon"
          variant="ghost"
        >
          <EllipsisIcon />
        </Button> */}
      </div>
    </button>
  );
}
