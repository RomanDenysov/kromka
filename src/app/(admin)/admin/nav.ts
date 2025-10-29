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
  type: "item";
  label: string;
  href: Route;
  icon?: LucideIcon;
  perm?: Permission;
  badgeKey?: string;
  exact?: boolean;
};

export type NavSection = {
  type: "section";
  label: string;
  href: Route;
  perm?: Permission;
  items: NavItem[];
};

export type AdminNavNode = NavItem | NavSection;

const NAV: AdminNavNode[] = [
  {
    type: "item",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    type: "section",
    label: "B2C",
    href: "/admin/b2c",
    perm: "b2c.read",
    items: [
      {
        type: "item",
        label: "Categories",
        href: "/admin/b2c/categories",
        icon: TagsIcon,
      },
      {
        type: "item",
        label: "Products",
        href: "/admin/b2c/products",
        icon: Package2Icon,
      },
      {
        type: "item",
        label: "Orders",
        href: "/admin/b2c/orders",
        icon: ShoppingBasketIcon,
        badgeKey: "b2c.orders",
      },
    ],
  },
  {
    type: "section",
    label: "B2B",
    href: "/admin/b2b",
    perm: "b2b.read",
    items: [
      {
        type: "item",
        label: "Orders",
        href: "/admin/b2b/orders",
        icon: ShoppingBasketIcon,
        badgeKey: "b2b.orders",
      },
      {
        type: "item",
        label: "Companies",
        href: "/admin/b2b/companies",
        icon: Building2Icon,
      },
      {
        type: "item",
        label: "Products",
        href: "/admin/b2b/products",
        icon: Package2Icon,
      },
      {
        type: "item",
        label: "Invoices",
        href: "/admin/b2b/invoices",
        icon: FileTextIcon,
        badgeKey: "b2b.invoices",
      },
    ],
  },
  {
    type: "section",
    label: "Blog",
    href: "/admin/blog",
    perm: "blog.read",
    items: [
      {
        type: "item",
        label: "Posts",
        href: "/admin/blog/posts",
        icon: BookAIcon,
      },
      {
        type: "item",
        label: "Tags",
        href: "/admin/blog/tags",
        icon: TagsIcon,
      },
      {
        type: "item",
        label: "Comments",
        href: "/admin/blog/comments",
        icon: MessageCircleIcon,
        badgeKey: "blog.comments",
      },
      {
        type: "item",
        label: "Settings",
        href: "/admin/blog/settings",
        perm: "settings.read",
        icon: SettingsIcon,
      },
    ],
  },
  {
    type: "section",
    label: "Settings",
    href: "/admin/settings",
    perm: "settings.read",
    items: [
      {
        type: "item",
        label: "Users",
        href: "/admin/settings/users",
        perm: "users.read",
        icon: Users2Icon,
      },
      {
        type: "item",
        label: "Roles",
        href: "/admin/settings/roles",
        perm: "roles.read",
        icon: ShieldUserIcon,
      },
      {
        type: "item",
        label: "Permissions",
        href: "/admin/settings/permissions",
        perm: "perms.read",
        icon: ShieldUserIcon,
      },
      {
        type: "item",
        label: "Configurations",
        href: "/admin/settings/configurations",
        perm: "config.read",
        icon: Settings2Icon,
      },
    ],
  },
];

export function useAdminNav({ role }: { role: string }): AdminNavNode[] {
  const perms = new Set(ROLE_PERMS[role] ?? []);

  const hasPerm = (perm?: Permission): boolean => {
    // biome-ignore lint/suspicious/noExplicitAny: TODO: Fix this later with better typing
    return !perm || perms.has(perm as any);
  };

  const filterNode = (node: AdminNavNode): AdminNavNode | null => {
    if (node.type === "item") {
      return hasPerm(node.perm) ? node : null;
    }

    // section
    if (!hasPerm(node.perm)) {
      return null;
    }
    const filteredItems = node.items
      .map((i) => (hasPerm(i.perm) ? i : null))
      .filter(Boolean) as NavItem[];
    return filteredItems.length > 0 ? { ...node, items: filteredItems } : null;
  };

  return NAV.map(filterNode).filter(Boolean) as AdminNavNode[];
}
