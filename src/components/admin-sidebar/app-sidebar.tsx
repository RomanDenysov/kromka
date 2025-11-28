"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ImagesIcon,
  LayoutDashboardIcon,
  Package2Icon,
  SettingsIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
  UsersIcon,
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
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useTRPC } from "@/trpc/client";

type Props = ComponentProps<typeof Sidebar> & {};

export default function AppSidebar({ ...props }: Props) {
  const trpc = useTRPC();
  const pathname = usePathname();
  const getIsActive = useMemo(
    () => (href: string, exact?: boolean) =>
      exact ? pathname === href : pathname.startsWith(href),
    [pathname]
  );

  const { data: newOrders } = useSuspenseQuery(
    trpc.admin.orders.list.queryOptions({
      status: "new",
    })
  );

  const newOrdersCount = useMemo(() => newOrders.length, [newOrders]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="[slot=sidebar-menu-button]:p-1.5!"
              tooltip="Vrátiť sa na hlavnú stránku"
            >
              <Link href="/">
                <Icons.logo className="size-4!" />
                <span className="font-semibold text-base tracking-tighter">
                  KROMKA
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={getIsActive("/admin", true)}
                tooltip="Prehľad"
              >
                <Link href="/admin" prefetch>
                  <LayoutDashboardIcon />
                  <span>Prehľad</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>E-shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/stores")}
                  tooltip="E-shop"
                >
                  <Link href="/admin/stores" prefetch>
                    <StoreIcon />
                    <span>Predajne</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/categories")}
                  tooltip="Kategórie"
                >
                  <Link href="/admin/categories" prefetch>
                    <TagsIcon />
                    <span>Kategórie</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/products")}
                  tooltip="Produkty"
                >
                  <Link href="/admin/products" prefetch>
                    <Package2Icon />
                    <span>Produkty</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/orders")}
                  tooltip={`Objednávky (${newOrdersCount} nových)`}
                >
                  <Link href="/admin/orders" prefetch>
                    <ShoppingBasketIcon />
                    <span>Objednávky</span>
                  </Link>
                </SidebarMenuButton>
                {newOrdersCount > 0 && (
                  <SidebarMenuBadge>{newOrdersCount}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/users")}
                  tooltip="Používatelia"
                >
                  <Link href="/admin/users" prefetch>
                    <UsersIcon />
                    <span>Používatelia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/media")}
                  tooltip="Médiá"
                >
                  <Link href="/admin/media" prefetch>
                    <ImagesIcon />
                    <span>Médiá</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={getIsActive("/admin/settings")}
                  tooltip="Nastavenia"
                >
                  <Link href="/admin/settings" prefetch>
                    <SettingsIcon />
                    <span>Nastavenia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppSidebarSkeleton() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Icons.logo className="size-4!" />
                <span className="font-semibold text-base tracking-tighter">
                  KROMKA
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 2 }).map((_, index) => (
                <SidebarMenuItem
                  key={`sidebar-menu-skeleton-top-${index.toString()}`}
                >
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuItem
                  key={`sidebar-menu-skeleton-middle-${index.toString()}`}
                >
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 4 }).map((_, index) => (
                <SidebarMenuItem
                  key={`sidebar-menu-skeleton-down-${index.toString()}`}
                >
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
