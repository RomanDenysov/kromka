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
import type { Route } from "next";
import { type Permission, ROLE_PERMS } from "@/lib/auth/rbac";

export type NavItem = {
  label: string;
  href: Route;
  icon?: LucideIcon;
  perm?: Permission;
  items?: NavItem[];
  badgeKey?: string;
  exact?: boolean;
};

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    label: "B2C",
    href: "/admin/b2c",
    perm: "b2c.read",
    items: [
      {
        label: "Categories",
        href: "/admin/b2c/categories",
        icon: TagsIcon,
      },
      {
        label: "Products",
        href: "/admin/b2c/products",
        icon: Package2Icon,
      },
      {
        label: "Orders",
        href: "/admin/b2c/orders",
        icon: ShoppingBasketIcon,
      },
    ],
  },
  {
    label: "B2B",
    href: "/admin/b2b",
    perm: "b2b.read",
    items: [
      {
        label: "Orders",
        href: "/admin/b2b/orders",
        icon: ShoppingBasketIcon,
        badgeKey: "b2c.orders",
      },
      {
        label: "Companies",
        href: "/admin/b2b/companies",
        icon: Building2Icon,
      },
      {
        label: "Products",
        href: "/admin/b2b/products",
        icon: Package2Icon,
      },
      {
        label: "Invoices",
        href: "/admin/b2b/invoices",
        icon: FileTextIcon,
        badgeKey: "b2b.invoices",
      },
    ],
  },
  {
    label: "Blog",
    href: "/admin/blog",
    perm: "blog.read",
    items: [
      {
        label: "Posts",
        href: "/admin/blog/posts",
        icon: BookAIcon,
      },
      {
        label: "Tags",
        href: "/admin/blog/tags",
        icon: TagsIcon,
      },
      {
        label: "Comments",
        href: "/admin/blog/comments",
        icon: MessageCircleIcon,
        badgeKey: "blog.comments",
      },
      {
        label: "Settings",
        href: "/admin/blog/settings",
        perm: "settings.read",
        icon: SettingsIcon,
      },
    ],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    perm: "settings.read",
    items: [
      {
        label: "Users",
        href: "/admin/settings/users",
        perm: "users.read",
        icon: Users2Icon,
      },
      {
        label: "Roles",
        href: "/admin/settings/roles",
        perm: "roles.read",
        icon: ShieldUserIcon,
      },
      {
        label: "Permissions",
        href: "/admin/settings/permissions",
        perm: "perms.read",
        icon: ShieldUserIcon,
      },
      {
        label: "Configurations",
        href: "/admin/settings/configurations",
        perm: "config.read",
        icon: Settings2Icon,
      },
    ],
  },
];

export function useAdminNav({ role }: { role: string }): NavItem[] {
  const perms = new Set(ROLE_PERMS[role] ?? []);
  const fit = (item: NavItem): boolean =>
    // biome-ignore lint/suspicious/noExplicitAny: TODO: Fix this later with better typing
    !item.perm || perms.has(item.perm as any);
  const filterTree = (items: NavItem[]): NavItem[] =>
    items
      .filter(fit)
      .map((i) => ({ ...i, items: i.items ? filterTree(i.items) : undefined }))
      .filter((i) => !i.items || i.items.length > 0);

  return filterTree(NAV);
}
