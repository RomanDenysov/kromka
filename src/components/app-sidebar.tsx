"use client";

import {
  LayoutDashboardIcon,
  type LucideIcon,
  Package2Icon,
  SettingsIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Props = ComponentProps<typeof Sidebar> & {};

export type NavItemConfig = {
  label: string;
  href: Route;
  icon?: LucideIcon;
  badgeKey?: string;
  exact?: boolean;
};

/**
 * Navigation section configuration
 */
export type NavSectionConfig = {
  label: string;
  href: Route;
  items: NavItemConfig[];
};

/**
 * Combined navigation node type
 */
export type NavNode = NavItemConfig | NavSectionConfig;

export const adminNavigation: NavNode[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    label: "E-shop",
    href: "/admin",
    items: [
      {
        label: "Predajne",
        href: "/admin/stores",
        icon: StoreIcon,
      },
      {
        label: "Kategórie",
        href: "/admin/categories",
        icon: TagsIcon,
      },
      {
        label: "Produkty",
        href: "/admin/products",
        icon: Package2Icon,
      },
      {
        label: "Objednávky",
        href: "/admin/orders",
        icon: ShoppingBasketIcon,
        badgeKey: "b2c.orders",
      },
    ],
  },
  // {
  //   label: "B2B",
  //   href: "/admin",
  //   items: [
  //     {
  //       label: "Companies",
  //       href: "/admin/invoices",
  //       icon: Building2Icon,
  //     },
  //     {
  //       label: "Invoices",
  //       href: "/admin/invoices",
  //       icon: FileTextIcon,
  //       badgeKey: "b2b.invoices",
  //     },
  //   ],
  // },
  // {
  //   label: "Blog",
  //   href: "/admin/blog",
  //   items: [
  //     {
  //       label: "Posts",
  //       href: "/admin/blog/posts",
  //       icon: BookAIcon,
  //     },
  //     {
  //       label: "Tags",
  //       href: "/admin/blog/tags",
  //       icon: TagsIcon,
  //     },
  //     {
  //       label: "Comments",
  //       href: "/admin/blog/comments",
  //       icon: MessageCircleIcon,
  //       badgeKey: "blog.comments",
  //     },
  //     {
  //       label: "Settings",
  //       href: "/admin/blog/settings",
  //       icon: SettingsIcon,
  //     },
  //   ],
  // },
  {
    label: "Nastavenia",
    href: "/admin/settings",
    icon: SettingsIcon,
  },
];

export default function AppSidebar({ ...props }: Props) {
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
        {adminNavigation.map((node) => {
          // Check if it's a section (has items) or a single item
          if ("items" in node) {
            // It's a section
            return (
              <SidebarGroup key={node.href + node.label}>
                <SidebarGroupLabel>{node.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {node.items.map((item) => {
                      const Icon = item.icon;
                      const active = getIsActive(item.href, item.exact);
                      return (
                        <SidebarMenuItem key={item.href + item.label}>
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
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // Single item at the root level
          const Icon = node.icon;
          const active = getIsActive(node.href, node.exact);
          return (
            <SidebarGroup key={node.href + node.label}>
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
