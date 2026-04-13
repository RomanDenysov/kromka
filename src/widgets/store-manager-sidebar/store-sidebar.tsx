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
} from "@/components/ui/sidebar";

interface NavItem<T extends string = string> {
  href: Route<T>;
  icon: LucideIcon;
  label: string;
}

function createNavManagement(slug: string): NavItem[] {
  return [
    {
      href: `/predajna/${slug}/prehlad` as Route,
      label: "Prehlad predajne",
      icon: BarChart3Icon,
    },
    {
      href: `/predajna/${slug}/produkty` as Route,
      label: "Produkty",
      icon: Package2Icon,
    },
    {
      href: `/predajna/${slug}/odpad` as Route,
      label: "Odpad / straty",
      icon: Trash2Icon,
    },
    {
      href: `/predajna/${slug}/otvaracie-hodiny` as Route,
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
          <SidebarMenuButton
            asChild
            className="[slot=sidebar-menu-button]:p-1.5!"
            size="sm"
            tooltip={storeName}
          >
            <Link href="/predajna">
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
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function PickupMenuItem({
  href,
  isActive,
  pickupCount,
}: {
  href: Route;
  isActive: boolean;
  pickupCount: number;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={
          pickupCount > 0
            ? `Objednavky na vyzdvihnutie (${pickupCount})`
            : "Objednavky na vyzdvihnutie"
        }
      >
        <Link href={href}>
          <PackageCheckIcon />
          <span>Objednavky na vyzdvihnutie</span>
        </Link>
      </SidebarMenuButton>
      {pickupCount > 0 && <SidebarMenuBadge>{pickupCount}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

function TomorrowOrderMenuItem({
  href,
  isActive,
  hasAlert,
}: {
  href: Route;
  isActive: boolean;
  hasAlert: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip="Objednavka na zajtra"
      >
        <Link href={href}>
          <CalendarPlusIcon />
          <span>Objednavka na zajtra</span>
        </Link>
      </SidebarMenuButton>
      {hasAlert && (
        <SidebarMenuBadge>
          <AlertCircleIcon className="size-3.5 text-destructive" />
        </SidebarMenuBadge>
      )}
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

  const navManagement = createNavManagement(storeSlug);
  const pickupHref = `/predajna/${storeSlug}/vyzdvihnutia` as Route;
  const scanHref = `/predajna/${storeSlug}/sken` as Route;
  const tomorrowHref = `/predajna/${storeSlug}/objednavka-na-zajtra` as Route;

  return (
    <Sidebar {...props}>
      <SidebarLogo storeName={storeName} storeType={storeType} />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Denne</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <PickupMenuItem
                href={pickupHref}
                isActive={isActive(pickupHref)}
                pickupCount={pickupCount}
              />
              <NavMenuItem
                isActive={isActive(scanHref)}
                item={{
                  href: scanHref,
                  label: "QR sken vyzdvihnutia",
                  icon: QrCodeIcon,
                }}
              />
              <TomorrowOrderMenuItem
                hasAlert={tomorrowOrderAlert}
                href={tomorrowHref}
                isActive={isActive(tomorrowHref)}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sprava</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navManagement.map((item) => (
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

function SkeletonGroup({ count, id }: { count: number; id: string }) {
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
            <SkeletonGroup count={3} id="daily" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SkeletonGroup count={4} id="management" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
