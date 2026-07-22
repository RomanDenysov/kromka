import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import type { CounterKey } from "@/features/admin-shell/types";

export interface NavItem<T extends string = string> {
  badgeKey?: CounterKey;
  exact?: boolean;
  href: Route<T>;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem<T>[];
  label: string;
}

export function collectNavItemBadgeKeys(item: NavItem): CounterKey[] {
  if (item.badgeKey) {
    return [item.badgeKey];
  }

  const keys: CounterKey[] = [];
  for (const sub of item.items ?? []) {
    if (sub.badgeKey) {
      keys.push(sub.badgeKey);
    }
  }
  return keys;
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
