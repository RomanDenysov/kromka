"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  findActiveNavItem,
  formatBadgeCount,
} from "@/widgets/admin-sidebar/sidebar-utils";

export interface SecondaryNavItem {
  badge?: number;
  href: Route;
  label: string;
}

interface Props {
  className?: string;
  items: SecondaryNavItem[];
}

export function SecondaryNav({ items, className }: Props) {
  const pathname = usePathname();
  const activeHref = findActiveNavItem(pathname, items)?.href;

  return (
    <nav className={cn("border-b px-4", className)}>
      <ul className="scrollbar-hide flex justify-start gap-1 overflow-x-auto py-2">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const badgeLabel = formatBadgeCount(item.badge ?? 0);

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "xs",
                  }),
                  "gap-1.5"
                )}
                href={item.href}
              >
                {item.label}
                {badgeLabel ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 font-medium text-[10px] tabular-nums",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badgeLabel}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
