"use client";

import { SquareArrowOutUpLeftIcon } from "lucide-react";
import Link from "next/link";
import { CategoryForm } from "@/app/(admin)/admin/categories/[id]/_components/category-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useCategoryParams } from "@/hooks/use-category-params";
import type { AdminCategory } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

export function EditCategorySheet({
  category,
  categories,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
}) {
  const { categoryId, setParams } = useCategoryParams();

  if (!categoryId) {
    return null;
  }

  return (
    <Sheet
      onOpenChange={(open) => !open && setParams({ categoryId: null })}
      open
    >
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b">
          <SheetTitle>Upraviť kategóriu</SheetTitle>
          <SheetDescription>{categoryId}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CategoryForm categories={categories} category={category}>
            {({ isPending }) => (
              <SheetFooter className="shrink-0 flex-row gap-2 border-t bg-background">
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "ml-auto"
                  )}
                  href={`/admin/categories/${categoryId}`}
                >
                  <SquareArrowOutUpLeftIcon />
                  Otvoriť
                </Link>
                <Button disabled={isPending} size="sm" type="submit">
                  Uložiť
                  {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
                </Button>
              </SheetFooter>
            )}
          </CategoryForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}
