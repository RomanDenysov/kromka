"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
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
} from "@/components/ui/sidebar";
import { domainNavBottom, domainNavMain } from "@/features/admin-shell/nav";
import { SidebarNavItem } from "./sidebar-nav-item";

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
              href="/admin/eshop"
            >
              <Icons.logo className="size-4!" />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

interface MainSidebarClientProps extends ComponentProps<typeof Sidebar> {
  badges?: Record<string, ReactNode>;
}

export default function MainSidebarClient({
  badges = {},
  ...props
}: MainSidebarClientProps) {
  return (
    <Sidebar
      className="h-dvh w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      collapsible="none"
      {...props}
    >
      <SidebarLogo />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {domainNavMain.map((item) => (
              <SidebarNavItem
                badge={badges[item.href]}
                item={item}
                key={item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {domainNavBottom.map((item) => (
                <SidebarNavItem
                  badge={badges[item.href]}
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
