import type { Route } from "next";
import { SecondaryNav } from "@/components/secondary-nav";
import { getSectionTabs } from "@/features/admin-shell/config.shared";
import { AdminNavBadge } from "./admin-nav-badge";

interface DomainSecondaryNavProps {
  domainSlug: string;
}

export function DomainSecondaryNav({ domainSlug }: DomainSecondaryNavProps) {
  const tabs = getSectionTabs(domainSlug);

  return (
    <SecondaryNav
      items={tabs.map((tab) => ({
        href: tab.href as Route,
        label: tab.label,
        badge: tab.badgeKey ? (
          <AdminNavBadge badgeKey={tab.badgeKey} variant="tab" />
        ) : undefined,
      }))}
    />
  );
}
