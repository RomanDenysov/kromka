"use client";

import {
  ArrowDown01Icon,
  ArrowDownAzIcon,
  ArrowUp01Icon,
  ArrowUpAzIcon,
} from "lucide-react";
import { useTransition } from "react";
import { useEshopParams } from "@/app/(public)/e-shop/eshop-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function SortToggles() {
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [{ sort }, setSearchParams] = useEshopParams({
    startTransition,
  });

  const [sortBy, direction] = (sort ?? "name_asc").split("_") as [
    "name" | "price",
    "asc" | "desc",
  ];

  const handleSort = (type: "name" | "price") => {
    startTransition(async () => {
      if (sortBy === type) {
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

  const NameIcon = direction === "asc" ? ArrowUpAzIcon : ArrowDownAzIcon;
  const PriceIcon = direction === "asc" ? ArrowUp01Icon : ArrowDown01Icon;

  return (
    <div className="flex gap-1">
      <Button
        disabled={isPending}
        onClick={() => handleSort("name")}
        size={isMobile ? "xs" : "default"}
        variant={sortBy === "name" ? "default" : "outline"}
      >
        Názov
        {sortBy === "name" && <NameIcon className="size-4" />}
      </Button>
      <Button
        disabled={isPending}
        onClick={() => handleSort("price")}
        size={isMobile ? "xs" : "default"}
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
      <Skeleton className="h-9 w-20 rounded-md" />
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
  );
}
