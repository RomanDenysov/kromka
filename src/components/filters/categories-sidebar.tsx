"use client";

import Link from "next/link";
import { use } from "react";
import {
  getCategoriesLink,
  useEshopParams,
} from "@/app/(public)/e-shop/eshop-params";
import type { Category } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";
import { LinkStatus } from "../shared/link-status";

type Props = {
  categories: Promise<Category[]>;
};

export function CategoriesSidebar({ categories }: Props) {
  const items = use(categories);
  const [{ category }, _setSearchParams] = useEshopParams();
  const allCategories = [{ slug: "", name: "Všetky" }, ...items];
  return (
    <aside className="sticky top-24 hidden w-48 shrink-0 md:block">
      <h2 className="mb-2 font-bold text-lg">Kategórie</h2>
      <nav className="flex flex-col gap-1">
        {allCategories.map((c) => (
          <Link
            className={cn(
              "rounded-lg px-3 py-2 text-left font-medium text-sm transition-colors",
              category === c.slug
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            href={getCategoriesLink({ category: c.slug })}
            key={c.slug}
          >
            <LinkStatus>{c.name}</LinkStatus>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
