"use client";

import type { LucideIcon } from "lucide-react";
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
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem<T extends string = string> = {
  href: Route<T>;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { href: "/admin", label: "Prehľad", icon: LayoutDashboardIcon, exact: true },
];

const NAV_ESHOP: NavItem[] = [
  { href: "/admin/stores", label: "Predajne", icon: StoreIcon },
  { href: "/admin/categories", label: "Kategórie", icon: TagsIcon },
  { href: "/admin/products", label: "Produkty", icon: Package2Icon },
];

const NAV_BOTTOM: NavItem[] = [
  { href: "/admin/users", label: "Používatelia", icon: UsersIcon },
  { href: "/admin/media", label: "Médiá", icon: ImagesIcon },
  { href: "/admin/settings", label: "Nastavenia", icon: SettingsIcon },
];

function SidebarLogo() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex flex-row items-center gap-1 group-data-[state=collapsed]:flex-col">
          <SidebarMenuButton
            asChild
            className="[slot=sidebar-menu-button]:p-1.5!"
            size="sm"
            tooltip="Vrátiť sa na hlavnú stránku"
          >
            <Link href="/">
              <Icons.logo className="size-4!" />
              <span className="font-semibold text-base tracking-tighter group-data-[state=collapsed]:hidden">
                KROMKA
              </span>
            </Link>
          </SidebarMenuButton>
          <SidebarTrigger className="group-data-[state=collapsed]:size-8" />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  const router = useRouter();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        onMouseEnter={() => router.prefetch(item.href)}
        tooltip={item.label}
      >
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function OrdersMenuItem({
  isActive,
  newOrdersCount,
}: {
  isActive: boolean;
  newOrdersCount?: number;
}) {
  const count = newOrdersCount ?? 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={count > 0 ? `Objednávky (${count} nových)` : "Objednávky"}
      >
        <Link href="/admin/orders">
          <ShoppingBasketIcon />
          <span>Objednávky</span>
        </Link>
      </SidebarMenuButton>
      {count > 0 && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  newOrdersCount?: number;
};

export default function AppSidebar({
  newOrdersCount,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar {...props}>
      <SidebarLogo />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_MAIN.map((item) => (
              <NavMenuItem
                isActive={isActive(item.href, item.exact)}
                item={item}
                key={item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>E-shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ESHOP.map((item) => (
                <NavMenuItem
                  isActive={isActive(item.href)}
                  item={item}
                  key={item.href}
                />
              ))}
              <OrdersMenuItem
                isActive={isActive("/admin/orders")}
                newOrdersCount={newOrdersCount}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_BOTTOM.map((item) => (
                <NavMenuItem
                  isActive={isActive(item.href)}
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

function SkeletonGroup({
  id,
  count,
  showIcon,
}: {
  id: string;
  count: number;
  showIcon?: boolean;
}) {
  return (
    <SidebarMenu>
      {Array.from({ length: count }, (_, i) => (
        <SidebarMenuItem key={`${id}-${i.toString()}`}>
          <SidebarMenuSkeleton showIcon={showIcon} />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebarSkeleton(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarLogo />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup count={1} id="main" showIcon />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup count={4} id="eshop" showIcon />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SkeletonGroup count={3} id="bottom" showIcon />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
