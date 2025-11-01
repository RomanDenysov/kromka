import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";
import { AddCategoryButton } from "./add-category-button";
import { CategoryItem } from "./category-item";

export function CategoriesListing({
  categories,
  selectedCategoryId,
  className,
}: {
  categories: Category[];
  selectedCategoryId?: string;
  className?: string;
}) {
  return (
    <section
      className={cn("size-full h-full max-w-xs shrink-0 border-r", className)}
    >
      <ScrollArea className="h-full p-3">
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <CategoryItem
              category={category}
              isSelected={category.id === selectedCategoryId}
              key={category.id}
            />
          ))}
          <AddCategoryButton />
        </div>
      </ScrollArea>
    </section>
  );
}
