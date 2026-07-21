"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, useMemo } from "react";
import { Icons } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  getAllDomainNavItems,
  getDomainNavItems,
} from "@/features/admin-shell/nav";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/badge-types";
import { cn } from "@/lib/utils";
import {
  findActiveNavItem,
  formatBadgeCount,
  getNavItemBadgeCount,
  type NavItem,
} from "./sidebar-utils";

function SidebarLogo() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="transition-colors duration-300 md:h-8 md:p-0"
            size="lg"
          >
            <Link
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              href={"/admin/eshop" as Route}
            >
              <Icons.logo className="size-4!" />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function NavBadge({ count, isActive }: { count: number; isActive?: boolean }) {
  const label = formatBadgeCount(count);
  if (!label) {
    return null;
  }

  return (
    <span
      className={cn(
        "pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 font-medium text-[10px] tabular-nums",
        isActive
          ? "border border-primary bg-primary-foreground text-primary"
          : "bg-primary text-primary-foreground"
      )}
    >
      {label}
    </span>
  );
}

function NavMenuItem({
  badges,
  item,
  isActive,
}: {
  badges: AdminSidebarBadges;
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  const badgeCount = getNavItemBadgeCount(item, badges);

  return (
    <SidebarMenuItem className="relative">
      <SidebarMenuButton
        asChild
        className="px-2.5 md:px-2"
        isActive={isActive}
        tooltip={{
          children: item.label,
          hidden: false,
        }}
      >
        <Link href={item.href}>
          {Icon ? <Icon /> : null}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      <NavBadge count={badgeCount} isActive={isActive} />
    </SidebarMenuItem>
  );
}

type MainSidebarProps = ComponentProps<typeof Sidebar> & {
  badges: AdminSidebarBadges;
};

export default function MainSidebar({ badges, ...props }: MainSidebarProps) {
  const pathname = usePathname();
  const navMain = useMemo(() => getDomainNavItems("main"), []);
  const navBottom = useMemo(() => getDomainNavItems("bottom"), []);
  const allNav = useMemo(() => getAllDomainNavItems(), []);
  const segment = useMemo(
    () => findActiveNavItem(pathname, allNav),
    [pathname, allNav]
  );

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarLogo />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map((item) => (
              <NavMenuItem
                badges={badges}
                isActive={segment?.href === item.href}
                item={item}
                key={item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navBottom.map((item) => (
                <NavMenuItem
                  badges={badges}
                  isActive={segment?.href === item.href}
                  item={item}
                  key={item.href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function SkeletonGroup({ id, count }: { id: string; count: number }) {
  return (
    <SidebarMenu>
      {Array.from({ length: count }, (_, i) => (
        <SidebarMenuItem key={`${id}-${i.toString()}`}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebarSkeleton(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarLogo />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup count={5} id="main" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SkeletonGroup count={2} id="bottom" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
