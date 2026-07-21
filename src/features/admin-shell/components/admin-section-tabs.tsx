"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/badge-types";
import { cn } from "@/lib/utils";
import {
  findActiveNavItem,
  formatBadgeCount,
} from "@/widgets/admin-sidebar/sidebar-utils";
import { getSectionTabs } from "../config.shared";

interface AdminSectionTabsProps {
  badges?: AdminSidebarBadges;
  className?: string;
  domainSlug: string;
}

export function AdminSectionTabs({
  domainSlug,
  badges,
  className,
}: AdminSectionTabsProps) {
  const pathname = usePathname();
  const tabs = getSectionTabs(domainSlug);

  if (tabs.length === 0) {
    return null;
  }

  const activeHref = findActiveNavItem(
    pathname,
    tabs.map((tab) => ({
      href: tab.href as Route,
      label: tab.label,
      badgeKey: tab.badgeKey,
    }))
  )?.href;

  return (
    <nav className={cn("border-b px-4", className)}>
      <ul className="scrollbar-hide flex justify-start gap-1 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const isActive = activeHref === tab.href;
          const badgeCount = tab.badgeKey && badges ? badges[tab.badgeKey] : 0;
          const badgeLabel = formatBadgeCount(badgeCount);

          return (
            <li key={tab.href}>
              <Link
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "xs",
                  }),
                  "gap-1.5"
                )}
                href={tab.href}
              >
                {tab.label}
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
