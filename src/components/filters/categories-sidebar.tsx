"use client";

import Link from "next/link";
import { use } from "react";
import {
  getCategoriesLink,
  useEshopParams,
} from "@/app/(public)/e-shop/eshop-params";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/features/categories/api/queries";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { LinkStatus } from "../shared/link-status";

type Props = {
  categories: Promise<Category[]>;
};

export function CategoriesSidebar({ categories }: Props) {
  const items = use(categories);
  const [{ category }] = useEshopParams();
  const allCategories = [{ slug: "", name: "Všetky" }, ...items];
  return (
    <aside className="sticky top-16 hidden w-48 shrink-0 self-start md:top-20 md:block">
      <h2 className="mb-4 p-1 font-bold text-lg">Kategórie</h2>
      <nav className="flex flex-col gap-1">
        {allCategories.map((c) => (
          <Link
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-left font-medium text-sm transition-colors",
              category === c.slug
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            href={getCategoriesLink({ category: c.slug })}
            key={c.slug}
            onClick={() =>
              analytics.categorySelected({
                category_slug: c.slug || "all",
                category_name: c.name,
              })
            }
          >
            <LinkStatus>{c.name}</LinkStatus>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function CategoriesSidebarSkeleton() {
  return (
    <aside className="sticky top-16 hidden w-48 shrink-0 self-start md:top-20 md:block">
      <h2 className="mb-4 p-1 font-bold text-lg">Kategórie</h2>
      <nav className="flex max-h-[calc(100svh-6rem)] flex-col gap-1 overflow-y-auto pr-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            className="h-10 w-full rounded-lg"
            key={`${i.toString()}-skeleton`}
          />
        ))}
      </nav>
    </aside>
  );
}
