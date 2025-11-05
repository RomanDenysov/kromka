"use client";

import { format } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/widgets/confirm-dialog/ui/confirm-provider";

export function CategoryItem({ category }: { category: Category }) {
  const [selectedCategoryId, setSelectedCategoryId] = useQueryState(
    "categoryId",
    parseAsString
  );

  const confirm = useConfirm();

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: "Vymazať kategoriu",
      description: "Naozaj chcete vymazať kategoriu? Táto akcia je nevratná.",
      confirmText: "Vymazať",
      variant: "destructive",
    });
    if (confirmed) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("vymazať kategoriu");
    }
  }, [confirm]);

  const isSelected = selectedCategoryId === category.id;

  const handleClick = () => {
    setSelectedCategoryId(isSelected ? null : category.id);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: we want to use a div for the button
    <div
      aria-pressed={isSelected}
      className={cn(
        "group/category-item w-full min-w-30 cursor-pointer border-transparent border-y p-3 text-left",
        isSelected && "border-border bg-muted"
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-sm">{category.name}</div>
          <div className="text-muted-foreground text-xs">
            {category.description}
          </div>
          <span className="text-muted-foreground text-xs">
            {format(category.createdAt, "dd.MM.yyyy HH:mm")} -{" "}
            {format(category.updatedAt, "dd.MM.yyyy HH:mm")}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              size="icon"
              variant="ghost"
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
              <Link href={`/admin/b2c/categories/${category.id}` as Route}>
                Upraviť
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Vymazať</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
