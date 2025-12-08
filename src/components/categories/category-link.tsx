"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LinkStatus } from "../shared/link-status";
import { buttonVariants } from "../ui/button";

export function CategoryLink({
  slug,
  label,
}: {
  slug: string | null;
  label: string;
}) {
  const params = useParams().category;
  return (
    <Link
      className={cn(
        buttonVariants({
          variant:
            params === slug || (slug === null && params === undefined)
              ? "default"
              : "secondary",
        }),
        "h-7 cursor-pointer gap-0.5 whitespace-nowrap rounded-md px-2 text-xs has-[>svg]:px-1.5 md:h-8 md:gap-1.5 md:rounded-md md:px-3 md:text-sm md:has-[>svg]:px-2.5"
      )}
      href={slug ? `/e-shop/${slug}` : "/e-shop"}
      prefetch
      scroll={false}
    >
      <LinkStatus variant="spinner">{label}</LinkStatus>
    </Link>
  );
}
