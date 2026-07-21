import type { Route } from "next";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/badge-types";
import type { NavItem } from "@/widgets/admin-sidebar/sidebar-utils";
import {
  getDomain,
  getDomainHref,
  getSectionHref,
  listDomains,
} from "./config.shared";
import { getAdminIcon } from "./icon-map";

function buildDomainNavItem(
  domain: ReturnType<typeof listDomains>[number]
): NavItem {
  const sections = Object.values(domain.sections);

  return {
    href: getDomainHref(domain.slug) as Route,
    label: domain.label,
    icon: getAdminIcon(domain.icon),
    items:
      sections.length > 0
        ? sections.map((section) => ({
            href: getSectionHref(domain.slug, section.slug) as Route,
            label: section.label,
            icon: section.icon ? getAdminIcon(section.icon) : undefined,
            badgeKey: section.badgeKey,
          }))
        : undefined,
  };
}

export function getDomainNavItems(placement: "main" | "bottom"): NavItem[] {
  return listDomains({ placement }).map(buildDomainNavItem);
}

export const domainNavMain = getDomainNavItems("main");
export const domainNavBottom = getDomainNavItems("bottom");
export const allDomainNavItems = [...domainNavMain, ...domainNavBottom];

export function getAllDomainNavItems(): NavItem[] {
  return allDomainNavItems;
}

export function getDomainBadgeCount(
  domainSlug: string,
  badges: AdminSidebarBadges
): number {
  const domain = getDomain(domainSlug);
  if (!domain) {
    return 0;
  }

  let sum = 0;
  for (const section of Object.values(domain.sections)) {
    if (section.badgeKey) {
      sum += badges[section.badgeKey];
    }
  }
  return sum;
}
