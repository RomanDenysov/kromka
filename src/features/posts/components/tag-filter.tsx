"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Tag } from "@/features/posts/api/queries";
import { cn } from "@/lib/utils";

type Props = {
  tags: Tag[];
  activeTag?: string;
  className?: string;
};

export function TagFilter({ tags, activeTag, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      // Reset page when changing tag
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const handleTagClick = (tagSlug: string | null) => {
    const query = createQueryString("tag", tagSlug);
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <ScrollArea className={cn("w-full whitespace-nowrap", className)}>
      <div className="flex gap-2 pb-2">
        {/* All posts button */}
        <button
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-3 py-1.5 font-medium text-sm transition-colors",
            !activeTag
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => handleTagClick(null)}
          type="button"
        >
          Všetky
        </button>

        {/* Tag buttons */}
        {tags.map((tag) => (
          <button
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-3 py-1.5 font-medium text-sm transition-colors",
              activeTag === tag.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
            )}
            key={tag.id}
            onClick={() => handleTagClick(tag.slug)}
            type="button"
          >
            {tag.name}
            <Badge
              className="ml-1 px-1.5 py-0 text-xs"
              variant={activeTag === tag.slug ? "secondary" : "outline"}
            >
              {tag.postCount}
            </Badge>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
