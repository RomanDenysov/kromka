"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertCircleIcon,
  BarChart3Icon,
  CalendarPlusIcon,
  ClockIcon,
  ExternalLinkIcon,
  Package2Icon,
  PackageCheckIcon,
  QrCodeIcon,
  Trash2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
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
      label: "Objednavky na vyzdvihnutie",
      icon: PackageCheckIcon,
      tooltip:
        pickupCount > 0
          ? `Objednavky na vyzdvihnutie (${pickupCount})`
          : undefined,
      badge:
        pickupCount > 0 ? (
          <SidebarMenuBadge>{pickupCount}</SidebarMenuBadge>
        ) : null,
    },
    {
      href: `${STORE_MANAGER_BASE_PATH}/${slug}/sken` as Route,
      label: "QR sken vyzdvihnutia",
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

function SidebarLogo({
  storeName,
  storeType,
}: {
  storeName: string;
  storeType?: string;
}) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex flex-row items-center gap-1 group-data-[state=collapsed]:flex-col">
          <SidebarMenuButton asChild size="sm" tooltip={storeName}>
            <Link href={STORE_MANAGER_BASE_PATH as Route}>
              <Icons.logo className="size-4!" />
              <div className="flex flex-col group-data-[state=collapsed]:hidden">
                <span className="font-semibold text-sm leading-tight">
                  {storeName}
                </span>
                {storeType && (
                  <span className="text-muted-foreground text-xs">
                    {storeType}
                  </span>
                )}
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.tooltip ?? item.label}
      >
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge}
    </SidebarMenuItem>
  );
}

type StoreSidebarProps = ComponentProps<typeof Sidebar> & {
  pickupCount?: number;
  storeName: string;
  storeSlug: string;
  storeType?: string;
  tomorrowOrderAlert?: boolean;
};

export default function StoreSidebar({
  storeName,
  storeSlug,
  storeType,
  pickupCount = 0,
  tomorrowOrderAlert = false,
  ...props
}: StoreSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  const dailyNav = createDailyNav(storeSlug, pickupCount, tomorrowOrderAlert);
  const managementNav = createManagementNav(storeSlug);

  return (
    <Sidebar {...props}>
      <SidebarLogo storeName={storeName} storeType={storeType} />

      <SidebarContent>
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Zobrazit e-shop">
                  <Link href="/" target="_blank">
                    <ExternalLinkIcon />
                    <span>Zobrazit e-shop</span>
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

function SkeletonGroup({ keys }: { keys: readonly string[] }) {
  return (
    <SidebarMenu>
      {keys.map((key) => (
        <SidebarMenuItem key={key}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

const DAILY_SKELETON_KEYS = ["daily-1", "daily-2", "daily-3"] as const;
const MANAGEMENT_SKELETON_KEYS = [
  "mgmt-1",
  "mgmt-2",
  "mgmt-3",
  "mgmt-4",
] as const;

export function StoreSidebarSkeleton(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup keys={DAILY_SKELETON_KEYS} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup keys={MANAGEMENT_SKELETON_KEYS} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
