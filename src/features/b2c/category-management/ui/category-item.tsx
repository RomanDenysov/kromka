"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";

export function CategoryItem({
  category,
  isSelected,
}: {
  category: Category;
  isSelected: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSelected) {
      params.delete("categoryId");
    } else {
      params.set("categoryId", category.id);
    }
    router.push(`/admin/b2c/categories?${params.toString()}`);
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
