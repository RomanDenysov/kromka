import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import type {
  AdminSidebarBadgeKey,
  AdminSidebarBadges,
} from "@/features/admin-sidebar/badge-types";

export interface NavItem<T extends string = string> {
  badgeKey?: AdminSidebarBadgeKey;
  exact?: boolean;
  href: Route<T>;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem<T>[];
  label: string;
}

export function isActiveRoute(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Longest matching href wins when multiple nav items match the pathname. */
export function findActiveNavItem(
  pathname: string,
  items: NavItem[]
): NavItem | null {
  let best: NavItem | null = null;

  for (const item of items) {
    if (!isActiveRoute(pathname, item.href, item.exact)) {
      continue;
    }
    if (!best || item.href.length > best.href.length) {
      best = item;
    }
  }

  return best;
}

const MAX_BADGE_COUNT = 99;

export function formatBadgeCount(count: number): string | null {
  if (count <= 0) {
    return null;
  }

  return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);
}

export function getNavItemBadgeCount(
  item: NavItem,
  badges: AdminSidebarBadges
): number {
  if (item.badgeKey) {
    return badges[item.badgeKey];
  }

  if (!item.items?.length) {
    return 0;
  }

  let sum = 0;
  for (const subItem of item.items) {
    sum += getNavItemBadgeCount(subItem, badges);
  }
  return sum;
}
