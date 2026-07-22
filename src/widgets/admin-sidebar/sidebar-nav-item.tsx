"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { allDomainNavItems } from "@/features/admin-shell/nav";
import { findActiveNavItem, type NavItem } from "./sidebar-utils";

interface SidebarNavItemProps {
  badge?: ReactNode;
  item: NavItem;
}

export function SidebarNavItem({ item, badge }: SidebarNavItemProps) {
  const pathname = usePathname();
  const activeHref = findActiveNavItem(pathname, allDomainNavItems)?.href;
  const isActive = activeHref === item.href;
  const Icon = item.icon;

  return (
    <SidebarMenuItem className="group/nav-item relative" data-active={isActive}>
      <SidebarMenuButton
        className="px-2.5 md:px-2"
        isActive={isActive}
        render={<Link href={item.href as Route} />}
        tooltip={{
          children: item.label,
          hidden: false,
        }}
      >
        {Icon ? <Icon /> : null}
        <span>{item.label}</span>
      </SidebarMenuButton>

      {badge}
    </SidebarMenuItem>
  );
}
