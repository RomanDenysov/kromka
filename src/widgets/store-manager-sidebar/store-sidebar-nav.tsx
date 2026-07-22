"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertCircleIcon,
  BarChart3Icon,
  CalendarPlusIcon,
  ClockIcon,
  Package2Icon,
  PackageCheckIcon,
  QrCodeIcon,
  Trash2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";

interface NavItem {
  badge?: ReactNode;
  href: Route;
  icon: LucideIcon;
  label: string;
  tooltip?: string;
}

function createDailyNav(
  slug: string,
  pickupCount: number,
  hasAlert: boolean
): NavItem[] {
  return [
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/vyzdvihnutia` as Route,
      label: "Objednavky",
      icon: PackageCheckIcon,
      tooltip: pickupCount > 0 ? "Objednavky" : undefined,
      badge:
        pickupCount > 0 ? (
          <SidebarMenuBadge>{pickupCount}</SidebarMenuBadge>
        ) : null,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/sken` as Route,
      label: "QR sken",
      icon: QrCodeIcon,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/objednavka-na-zajtra` as Route,
      label: "Objednavka na zajtra",
      icon: CalendarPlusIcon,
      badge: hasAlert ? (
        <SidebarMenuBadge>
          <AlertCircleIcon className="size-3.5 text-destructive" />
        </SidebarMenuBadge>
      ) : null,
    },
  ];
}

function createManagementNav(slug: string): NavItem[] {
  return [
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/prehlad` as Route,
      label: "Prehlad predajne",
      icon: BarChart3Icon,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/produkty` as Route,
      label: "Produkty",
      icon: Package2Icon,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/odpad` as Route,
      label: "Odpad / straty",
      icon: Trash2Icon,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/otvaracie-hodiny` as Route,
      label: "Otvaracie hodiny",
      icon: ClockIcon,
    },
  ];
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link href={item.href} />}
        tooltip={item.tooltip ?? item.label}
      >
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>

      {item.badge}
    </SidebarMenuItem>
  );
}

export interface StoreSidebarNavProps {
  pickupCount?: number;
  storeSlug: string;
  tomorrowOrderAlert?: boolean;
}

/**
 * Client-only nav list. Needs `usePathname()` for active-link highlighting,
 * so it is split from the server-side data loaders.
 */
export function StoreSidebarNav({
  storeSlug,
  pickupCount = 0,
  tomorrowOrderAlert = false,
}: StoreSidebarNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  const dailyNav = createDailyNav(storeSlug, pickupCount, tomorrowOrderAlert);
  const managementNav = createManagementNav(storeSlug);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Denne</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {dailyNav.map((item) => (
              <NavMenuItem
                isActive={isActive(item.href)}
                item={item}
                key={item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Sprava</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {managementNav.map((item) => (
              <NavMenuItem
                isActive={isActive(item.href)}
                item={item}
                key={item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
