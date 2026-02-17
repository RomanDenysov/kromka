"use client";

import { debounce } from "nuqs";
import { useTransition } from "react";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { analytics } from "@/lib/analytics";
import { useEshopParams } from "./eshop-params";

const DEBOUNCE_DELAY = 300;

export function ProductSearch() {
  const [isPending, startTransition] = useTransition();
  const [{ q }, setSearchParams] = useEshopParams({
    startTransition,
  });

  return (
    <SearchInput
      className="flex-2"
      isLoading={isPending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(async () => {
          await setSearchParams(
            { q: value },
            {
              limitUrlUpdates: value
                ? debounce(DEBOUNCE_DELAY)
                : undefined,
            }
          );
          if (value.trim()) {
            analytics.searchPerformed({
              query: value.trim(),
              results_count: 0,
            });
          }
        });
      }}
      placeholder="Hľadať produkty..."
      value={q}
    />
  );
}

export function ProductSearchSkeleton() {
  return <Skeleton className="h-10 w-full flex-2" />;
}
