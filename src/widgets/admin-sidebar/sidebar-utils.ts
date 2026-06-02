import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/api/queries";

export type AdminSidebarBadgeKey = keyof AdminSidebarBadges;

export interface NavItem<T extends string = string> {
  badgeKey?: AdminSidebarBadgeKey;
  exact?: boolean;
  href: Route<T>;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem<T>[];
  label: string;
}

export const isActiveRoute = (
  pathname: string,
  href: string,
  exact?: boolean
): boolean => (exact ? pathname === href : pathname.startsWith(href));

/** Longest matching href wins when multiple nav items match the pathname. */
export const findActiveNavItem = (
  pathname: string,
  items: NavItem[]
): NavItem | null =>
  items
    .filter((item) => isActiveRoute(pathname, item.href, item.exact))
    .sort((a, b) => b.href.length - a.href.length)[0] ?? null;

const MAX_BADGE_COUNT = 99;

export const formatBadgeCount = (count: number): string | null => {
  if (count <= 0) {
    return null;
  }

  return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);
};

export const getNavItemBadgeCount = (
  item: NavItem,
  badges: AdminSidebarBadges
): number => {
  if (item.badgeKey) {
    return badges[item.badgeKey];
  }

  return (
    item.items?.reduce(
      (sum, subItem) => sum + getNavItemBadgeCount(subItem, badges),
      0
    ) ?? 0
  );
};
