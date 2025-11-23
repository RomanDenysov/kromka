import {
  BookAIcon,
  Building2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  Package2Icon,
  Settings2Icon,
  SettingsIcon,
  ShieldUserIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
  Users2Icon,
} from "lucide-react";
import type { NavNode } from "../model/types";

export const adminNavigation: NavNode[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    label: "B2C",
    href: "/admin",
    perm: "b2c.read",
    items: [
      {
        label: "Stores",
        href: "/admin/stores",
        icon: StoreIcon,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: TagsIcon,
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package2Icon,
      },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingBasketIcon,
        badgeKey: "b2c.orders",
      },
    ],
  },
  {
    label: "B2B",
    href: "/admin",
    perm: "b2b.read",
    items: [
      {
        label: "Companies",
        href: "/admin/invoices",
        icon: Building2Icon,
      },
      {
        label: "Invoices",
        href: "/admin/invoices",
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
