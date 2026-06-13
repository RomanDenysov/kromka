"use client";

import {
  ActivityIcon,
  BriefcaseIcon,
  ChartColumnIcon,
  ChefHatIcon,
  ClipboardListIcon,
  FactoryIcon,
  FileTextIcon,
  FlaskConicalIcon,
  ImagesIcon,
  MessageSquareIcon,
  NewspaperIcon,
  Package2Icon,
  SettingsIcon,
  ShoppingCartIcon,
  StoreIcon,
  TagsIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
  WheatIcon,
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
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/api/queries";
import { cn } from "@/lib/utils";
import {
  findActiveNavItem,
  formatBadgeCount,
  getNavItemBadgeCount,
  isActiveRoute,
  type NavItem,
} from "./sidebar-utils";

const NAV_MAIN: NavItem[] = [
  {
    href: "/admin/eshop",
    label: "E-shop",
    icon: StoreIcon,
    items: [
      { href: "/admin/eshop/stores", label: "Predajne", icon: StoreIcon },
      { href: "/admin/eshop/categories", label: "Kategórie", icon: TagsIcon },
      { href: "/admin/eshop/products", label: "Produkty", icon: Package2Icon },
      {
        href: "/admin/eshop/orders",
        label: "Objednávky",
        icon: ClipboardListIcon,
        badgeKey: "newOrders",
      },
      {
        href: "/admin/eshop/carts",
        label: "Košíky",
        icon: ShoppingCartIcon,
        badgeKey: "activeCarts",
      },
    ],
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: NewspaperIcon,
    items: [
      { href: "/admin/blog/posts", label: "Články", icon: NewspaperIcon },
      { href: "/admin/blog/tags", label: "Štítky", icon: TagsIcon },
      {
        href: "/admin/blog/comments",
        label: "Komentáre",
        icon: MessageSquareIcon,
        badgeKey: "pendingComments",
      },
    ],
  },
  {
    href: "/admin/b2b",
    label: "B2B",
    icon: BriefcaseIcon,
    items: [
      {
        href: "/admin/b2b/applications",
        label: "Žiadosti",
        icon: FileTextIcon,
        badgeKey: "pendingApplications",
      },
      { href: "/admin/b2b/clients", label: "Klienti", icon: BriefcaseIcon },
      {
        href: "/admin/b2b/price-tiers",
        label: "Cenové skupiny",
        icon: WalletIcon,
      },
      { href: "/admin/b2b/invoices", label: "Faktúry", icon: FileTextIcon },
    ],
  },
  {
    href: "/admin/production",
    label: "Výroba",
    icon: FactoryIcon,
    items: [
      {
        href: "/admin/production/recipes",
        label: "Recepty",
        icon: ChefHatIcon,
      },
      {
        href: "/admin/production/ingredients",
        label: "Suroviny",
        icon: WheatIcon,
      },
    ],
  },
  {
    href: "/admin/reports",
    label: "Reporty",
    icon: ChartColumnIcon,
    items: [
      {
        href: "/admin/reports/profitability/products",
        label: "Ziskovosť produktov",
        icon: TrendingUpIcon,
      },
      {
        href: "/admin/reports/profitability/stores",
        label: "Ziskovosť predajní",
        icon: TrendingUpIcon,
      },
    ],
  },
];

const NAV_BOTTOM: NavItem[] = [
  {
    href: "/admin/system",
    label: "Systém",
    icon: SettingsIcon,
    items: [
      { href: "/admin/system/users", label: "Používatelia", icon: UsersIcon },
      { href: "/admin/system/media", label: "Médiá", icon: ImagesIcon },
      {
        href: "/admin/system/activity",
        label: "Aktivita",
        icon: ActivityIcon,
      },
      {
        href: "/admin/system/settings",
        label: "Nastavenia",
        icon: SettingsIcon,
      },
    ],
  },
  {
    href: "/admin/playground",
    label: "Playground",
    icon: FlaskConicalIcon,
  },
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
            <Link href="#">
              <Icons.logo className="size-4!" />
              <span className="font-semibold text-base tracking-tighter group-data-[state=collapsed]:hidden">
                KROMKA
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

const ALL_NAV_ITEMS = [...NAV_MAIN, ...NAV_BOTTOM];

function NavBadge({
  count,
  variant = "menu",
  isActive,
}: {
  count: number;
  variant?: "menu" | "rail";
  isActive?: boolean;
}) {
  const label = formatBadgeCount(count);
  if (!label) {
    return null;
  }

  if (variant === "rail") {
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

  return (
    <SidebarMenuBadge className={cn(isActive ? "bg-primary-foreground" : "")}>
      {label}
    </SidebarMenuBadge>
  );
}

function NavMenuItem({
  badges,
  item,
  isActive,
  showBadge = "rail",
}: {
  badges: AdminSidebarBadges;
  item: NavItem;
  isActive: boolean;
  showBadge?: "rail" | "none";
}) {
  const Icon = item.icon;
  const badgeCount = getNavItemBadgeCount(item, badges);

  return (
    <SidebarMenuItem className={showBadge === "rail" ? "relative" : undefined}>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link href={item.href}>
          {Icon && <Icon />}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {showBadge === "rail" ? (
        <NavBadge count={badgeCount} isActive={isActive} variant="rail" />
      ) : null}
    </SidebarMenuItem>
  );
}

export default function MainSidebar({
  badges,
}: {
  badges: AdminSidebarBadges;
}) {
  const pathname = usePathname();
  const segment = useMemo(
    () => findActiveNavItem(pathname, ALL_NAV_ITEMS),
    [pathname]
  );

  return (
    <Sidebar
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      variant="floating"
    >
      <Sidebar
        className="w-[calc(var(--sidebar-width-icon)+1px)]! rounded-l-lg border-r"
        collapsible="none"
        variant="floating"
      >
        <SidebarLogo />

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
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
                {NAV_BOTTOM.map((item) => (
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

      {/* Second pane is URL-derived; empty on routes without a sub-nav. */}
      <Sidebar
        className="hidden flex-1 rounded-r-lg md:flex"
        collapsible="none"
        variant="floating"
      >
        <SidebarHeader>
          <SidebarInput placeholder="Hľadať..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {segment?.items?.map((item) => {
                  const Icon = item.icon;
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                  return (
                    <SidebarMenuItem className="w-full" key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveRoute(
                          pathname,
                          item.href,
                          item.exact
                        )}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          {Icon && <Icon />}
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      <NavBadge
                        count={badgeCount}
                        isActive={segment?.href === item.href}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
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
            <SkeletonGroup count={5} id="main" showIcon />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SkeletonGroup count={2} id="bottom" showIcon />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
