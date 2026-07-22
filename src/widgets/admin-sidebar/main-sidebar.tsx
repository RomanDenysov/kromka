import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { AdminNavBadge } from "@/features/admin-shell/components/admin-nav-badge";
import { domainNavBottom, domainNavMain } from "@/features/admin-shell/nav";
import MainSidebarClient from "./main-sidebar.client";
import { collectNavItemBadgeKeys } from "./sidebar-utils";

const MAIN_NAV_SKELETON_KEYS = [
  "main-1",
  "main-2",
  "main-3",
  "main-4",
  "main-5",
] as const;
const BOTTOM_NAV_SKELETON_KEYS = ["bottom-1"] as const;

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

export function MainSidebarSkeleton() {
  return (
    <Sidebar
      className="h-dvh w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      collapsible="none"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {MAIN_NAV_SKELETON_KEYS.map((key) => (
              <SidebarMenuItem key={key}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {BOTTOM_NAV_SKELETON_KEYS.map((key) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
