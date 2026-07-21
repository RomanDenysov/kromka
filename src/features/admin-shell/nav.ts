import type { Route } from "next";
import type { NavItem } from "@/widgets/admin-sidebar/sidebar-utils";
import { getDomainHref, getSectionHref, listDomains } from "./config.shared";
import { adminIconMap } from "./icon-map";

function buildDomainNavItem(
  domain: ReturnType<typeof listDomains>[number]
): NavItem {
  const sections = Object.entries(domain.sections);

  return {
    href: getDomainHref(domain.slug) as Route,
    label: domain.label,
    icon: adminIconMap[domain.icon],
    items:
      sections.length > 0
        ? sections.map(([sectionSlug, section]) => ({
            href: getSectionHref(domain.slug, sectionSlug) as Route,
            label: section.label,
            badgeKey: section.badgeKey,
          }))
        : undefined,
  };
}

export const domainNavMain = listDomains({ placement: "main" }).map(
  buildDomainNavItem
);
export const domainNavBottom = listDomains({ placement: "bottom" }).map(
  buildDomainNavItem
);
export const allDomainNavItems = [...domainNavMain, ...domainNavBottom];
