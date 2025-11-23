import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import type { Permission } from "@/lib/auth/rbac";

/**
 * Navigation item configuration
 */
export type NavItemConfig = {
  label: string;
  href: Route;
  icon?: LucideIcon;
  perm?: Permission;
  badgeKey?: string;
  exact?: boolean;
};

/**
 * Navigation section configuration
 */
export type NavSectionConfig = {
  label: string;
  href: Route;
  perm?: Permission;
  items: NavItemConfig[];
};

/**
 * Combined navigation node type
 */
export type NavNode = NavItemConfig | NavSectionConfig;
