"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Item = {
  label: string;
  href: Route;
};

type Props = {
  items: Item[];
  className?: string;
};

export function SecondaryNav({ items, className }: Props) {
  const pathname = usePathname();
  return (
    <nav className={cn("p-2", className)}>
      <ul className="scrollbar-hide flex justify-start gap-2 overflow-auto">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className={cn(
                buttonVariants({
                  variant: pathname === item.href ? "secondary" : "ghost",
                  size: "xs",
                })
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
