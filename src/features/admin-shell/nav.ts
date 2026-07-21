import type { Route } from "next";
import type { AdminSidebarBadgeKey } from "@/features/admin-sidebar/badge-types";
import type { NavItem } from "@/widgets/admin-sidebar/sidebar-utils";
import { getDomainHref, getSectionHref, listDomains } from "./config.shared";
import { getAdminIcon } from "./icon-map";

export function getDomainNavItems(placement: "main" | "bottom"): NavItem[] {
  return listDomains({ placement }).map((domain) => {
    const sections = Object.values(domain.sections);
    const items: NavItem[] | undefined =
      sections.length > 0
        ? sections.map((section) => ({
            href: getSectionHref(domain.slug, section.slug) as Route,
            label: section.label,
            icon: section.icon ? getAdminIcon(section.icon) : undefined,
            badgeKey: section.badgeKey,
          }))
        : undefined;

    return {
      href: getDomainHref(domain.slug) as Route,
      label: domain.label,
      icon: getAdminIcon(domain.icon),
      items,
    };
  });
}

export function getAllDomainNavItems(): NavItem[] {
  return [...getDomainNavItems("main"), ...getDomainNavItems("bottom")];
}

export function getDomainBadgeCount(
  domainSlug: string,
  badges: Record<AdminSidebarBadgeKey, number>
): number {
  const domain = listDomains().find((d) => d.slug === domainSlug);
  if (!domain) {
    return 0;
  }

  return Object.values(domain.sections).reduce((sum, section) => {
    if (!section.badgeKey) {
      return sum;
    }
    return sum + badges[section.badgeKey];
  }, 0);
}
