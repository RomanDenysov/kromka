"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = {
  href: Route;
  label: string;
};

type Props = {
  items: Item[];
  className?: string;
};

export function SecondaryMenu({ items, className }: Props) {
  const pathname = usePathname();

  return (
    <nav className={cn("py-3", className)}>
      <ul className="scrollbar-hide flex space-x-6 overflow-auto text-sm">
        {items.map((item) => (
          <Link
            className={cn(
              "text-primary/80",
              pathname === item.href &&
                "font-medium text-primary underline underline-offset-4"
            )}
            href={item.href}
            key={item.href}
            prefetch
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
