/** biome-ignore-all lint/style/noMagicNumbers: Ignore it for now */
"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { LinkStatus } from "@/components/shared/link-status";
import { ShowMoreInline } from "@/components/show-more";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/features/categories/api/queries";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { getCategoriesLink, useEshopParams } from "./eshop-params";

interface Props {
  categories: Promise<Category[]>;
}

export function CategoriesChips({ categories }: Props) {
  const items = use(categories);
  const [{ category }] = useEshopParams();
  const allCategories = [{ slug: "", name: "Všetky" }, ...items];
  return (
    <div className="flex flex-wrap gap-1.5 md:hidden">
      <ShowMoreInline
        className="ml-2 text-xs underline underline-offset-2"
        initial={5}
      >
        {allCategories.map((c) => {
          const isActive = category === c.slug;
          const isFeatured = "isFeatured" in c && c.isFeatured;
          return (
            <Badge
              className={cn(
                isFeatured && !isActive && "border-featured/30 text-featured"
              )}
              key={c.slug}
              variant={isActive ? "default" : "outline"}
            >
              <Link
                href={getCategoriesLink({ category: c.slug })}
                onClick={() =>
                  analytics.categorySelected({
                    category_slug: c.slug || "all",
                    category_name: c.name,
                  })
                }
              >
                <LinkStatus className="flex items-center gap-1">
                  {isFeatured && <SparklesIcon className="size-3 shrink-0" />}
                  {c.name}
                </LinkStatus>
              </Link>
            </Badge>
          );
        })}
      </ShowMoreInline>
    </div>
  );
}

export function CategoriesChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-1.5 md:hidden">
      {[16, 24, 20, 14, 18].map((width) => (
        <Skeleton
          className="h-[22px] rounded-full"
          key={`chip-skeleton-${width}`}
          style={{ width: `${width * 4}px` }}
        />
      ))}
    </div>
  );
}
