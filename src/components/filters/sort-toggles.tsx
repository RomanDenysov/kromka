"use client";

import {
  ArrowDown01Icon,
  ArrowDownAzIcon,
  ArrowUp01Icon,
  ArrowUpAzIcon,
} from "lucide-react";
import { useTransition } from "react";
import { useEshopParams } from "@/app/(public)/e-shop/eshop-params";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SortToggles() {
  // const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [{ sort }, setSearchParams] = useEshopParams({
    startTransition,
  });

  const isDefaultSort = sort === "sort_order";
  const [sortBy, direction] = isDefaultSort
    ? ([null, null] as const)
    : ((sort ?? "name_asc").split("_") as ["name" | "price", "asc" | "desc"]);

  const handleSort = (type: "name" | "price") => {
    startTransition(async () => {
      if (sortBy === type && direction) {
        // Toggle direction
        await setSearchParams({
          sort: `${type}_${direction === "asc" ? "desc" : "asc"}`,
        });
      } else {
        // Switch type, default asc
        await setSearchParams({ sort: `${type}_asc` });
      }
    });
  };

  const NameIcon = direction === "desc" ? ArrowDownAzIcon : ArrowUpAzIcon;
  const PriceIcon = direction === "desc" ? ArrowDown01Icon : ArrowUp01Icon;

  return (
    <div className="flex gap-1">
      <Button
        className="md:h-9 md:px-4 md:py-2 md:text-sm md:has-[>svg]:px-3"
        disabled={isPending}
        onClick={() => handleSort("name")}
        size="xs"
        variant={sortBy === "name" ? "default" : "outline"}
      >
        Názov
        {sortBy === "name" && <NameIcon className="size-4" />}
      </Button>
      <Button
        className="md:h-9 md:px-4 md:py-2 md:text-sm md:has-[>svg]:px-3"
        disabled={isPending}
        onClick={() => handleSort("price")}
        size="xs"
        variant={sortBy === "price" ? "default" : "outline"}
      >
        Cena
        {sortBy === "price" && <PriceIcon className="size-4" />}
      </Button>
    </div>
  );
}

export function SortTogglesSkeleton() {
  return (
    <div className="flex gap-1">
      <Skeleton className="h-7 w-20 rounded-md md:h-9" />
      <Skeleton className="h-7 w-20 rounded-md md:h-9" />
    </div>
  );
}
