"use client";

import Link from "next/link";
import { use } from "react";
import { LinkStatus } from "@/components/shared/link-status";
import { ShowMoreInline } from "@/components/show-more";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/queries/categories";
import { getCategoriesLink, useEshopParams } from "./eshop-params";

type Props = {
  categories: Promise<Category[]>;
};

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
        {allCategories.map((c) => (
          <Badge
            key={c.slug}
            variant={category === c.slug ? "default" : "outline"}
          >
            <Link href={getCategoriesLink({ category: c.slug })}>
              <LinkStatus>{c.name}</LinkStatus>
            </Link>
          </Badge>
        ))}
      </ShowMoreInline>
    </div>
  );
}
