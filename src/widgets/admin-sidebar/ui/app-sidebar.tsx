"use client";

import {
  BookAIcon,
  Building2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MessageCircleIcon,
  Package2Icon,
  Settings2Icon,
  SettingsIcon,
  ShieldUserIcon,
  ShoppingBasketIcon,
  TagsIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, useMemo } from "react";
import { Icons } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavNode } from "../model/get-nav";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  Tags: TagsIcon,
  Package2: Package2Icon,
  ShoppingBasket: ShoppingBasketIcon,
  Building2: Building2Icon,
  FileText: FileTextIcon,
  BookA: BookAIcon,
  MessageCircle: MessageCircleIcon,
  Settings: SettingsIcon,
  Users2: Users2Icon,
  ShieldUser: ShieldUserIcon,
  Settings2: Settings2Icon,
};

type Props = ComponentProps<typeof Sidebar> & {
  navigation: NavNode[];
  badgeCounts: Record<string, number>;
};

export default function AppSidebar({
  navigation,
  badgeCounts,
  ...props
}: Props) {
  const pathname = usePathname();
  const getIsActive = useMemo(
    () => (href: string, exact?: boolean) =>
      exact ? pathname === href : pathname.startsWith(href),
    [pathname]
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <Icons.logo className="size-5!" />
                <span className="font-semibold text-base tracking-tighter">
                  KROMKA Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((node) => {
          // Check if it's a section (has items) or a single item
          if ("items" in node) {
            // It's a section
            return (
              <SidebarGroup key={node.href}>
                <SidebarGroupLabel>{node.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {node.items.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : undefined;
                      const active = getIsActive(item.href, item.exact);
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.label}
                          >
                            <Link
                              aria-current={active ? "page" : undefined}
                              href={item.href}
                            >
                              {Icon && <Icon />}
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                          {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                            <SidebarMenuBadge>
                              {badgeCounts[item.badgeKey]}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // Single item at the root level
          const Icon = node.icon ? iconMap[node.icon] : undefined;
          const active = getIsActive(node.href, node.exact);
          return (
            <SidebarGroup key={node.href}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={node.label}
                    >
                      <Link
                        aria-current={active ? "page" : undefined}
                        href={node.href}
                      >
                        {Icon && <Icon />}
                        <span>{node.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {node.badgeKey && badgeCounts[node.badgeKey] > 0 && (
                      <SidebarMenuBadge>
                        {badgeCounts[node.badgeKey]}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

