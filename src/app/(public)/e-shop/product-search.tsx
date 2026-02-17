"use client";

import { debounce } from "nuqs";
import { useRef, useTransition } from "react";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { analytics } from "@/lib/analytics";
import { useEshopParams } from "./eshop-params";

const DEBOUNCE_DELAY = 300;
const SEARCH_ANALYTICS_DELAY = 800;

export function ProductSearch() {
  const [isPending, startTransition] = useTransition();
  const [{ q }, setSearchParams] = useEshopParams({
    startTransition,
  });
  const analyticsTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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
        });
        clearTimeout(analyticsTimer.current);
        if (value.trim()) {
          analyticsTimer.current = setTimeout(() => {
            analytics.searchPerformed({ query: value.trim() });
          }, SEARCH_ANALYTICS_DELAY);
        }
      }}
      placeholder="Hľadať produkty..."
      value={q}
    />
  );
}

export function ProductSearchSkeleton() {
  return <Skeleton className="h-10 w-full flex-2" />;
}
