"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { findActiveNavItem } from "@/widgets/admin-sidebar/sidebar-utils";

export interface SecondaryNavItem {
  badge?: ReactNode;
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

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  buttonVariants({
                    variant: "link",
                    size: "xs",
                  }),
                  "group/tab gap-1.5",
                  isActive && "text-primary underline"
                )}
                data-active={isActive}
                href={item.href}
              >
                {item.label}
                {item.badge}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
