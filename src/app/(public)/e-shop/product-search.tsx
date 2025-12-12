"use client";

import { debounce } from "nuqs";
import { useTransition } from "react";
import { SearchInput } from "@/components/shared/search-input";
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
      onChange={(e) =>
        startTransition(async () => {
          await setSearchParams(
            {
              q: e.target.value,
            },
            {
              limitUrlUpdates: e.target.value
                ? debounce(DEBOUNCE_DELAY)
                : undefined,
            }
          );
        })
      }
      placeholder="Hľadať produkty..."
      value={q}
    />
  );
}
