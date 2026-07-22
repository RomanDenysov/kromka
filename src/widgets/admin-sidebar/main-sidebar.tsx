import type { ReactNode } from "react";
import { AdminNavBadge } from "@/features/admin-shell/components/admin-nav-badge";
import { domainNavBottom, domainNavMain } from "@/features/admin-shell/nav";
import MainSidebarClient from "./main-sidebar.client";
import { collectNavItemBadgeKeys } from "./sidebar-utils";

function buildBadgeSlots(items: typeof domainNavMain) {
  const badges: Record<string, ReactNode> = {};

  for (const item of items) {
    const badgeKeys = collectNavItemBadgeKeys(item);
    if (badgeKeys.length === 0) {
      continue;
    }

    badges[item.href] = (
      <AdminNavBadge badgeKeys={badgeKeys} variant="sidebar" />
    );
  }

  return badges;
}

export default function MainSidebar() {
  const badges = {
    ...buildBadgeSlots(domainNavMain),
    ...buildBadgeSlots(domainNavBottom),
  };

  return <MainSidebarClient badges={badges} />;
}
