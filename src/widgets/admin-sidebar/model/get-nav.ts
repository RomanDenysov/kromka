"use server";

import { type Permission, ROLE_PERMS } from "@/lib/auth/rbac";
import { getRole } from "@/lib/get-session";
import { b2bSection } from "../config/sections/b2b-section";
import { b2cSection } from "../config/sections/b2c-section";
import { blogSection } from "../config/sections/blog-section";
import { dashboardSection } from "../config/sections/dashboard-section";
import { settingsSection } from "../config/sections/settings-section";
import type { NavItemConfig, NavSectionConfig } from "./types";

/**
 * Combined navigation node type
 */
export type NavNode = NavItemConfig | NavSectionConfig;

/**
 * Check if user has required permission
 */
function hasPermission(perms: Set<Permission>, perm?: Permission): boolean {
  return !perm || perms.has(perm);
}

/**
 * Filter navigation items based on permissions
 */
function filterItem(
  item: NavItemConfig,
  perms: Set<Permission>
): NavItemConfig | null {
  return hasPermission(perms, item.perm) ? item : null;
}

/**
 * Filter navigation section based on permissions
 */
function filterSection(
  section: NavSectionConfig,
  perms: Set<Permission>
): NavSectionConfig | null {
  if (!hasPermission(perms, section.perm)) {
    return null;
  }

  const filteredItems = section.items
    .map((item) => filterItem(item, perms))
    .filter(Boolean) as NavItemConfig[];

  return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
}

/**
 * Get filtered navigation based on user role and permissions
 */
export async function getNav(): Promise<NavNode[]> {
  const role = await getRole();

  if (!role) {
    return [];
  }

  const perms = new Set(ROLE_PERMS[role] ?? []);

  const sections = [
    dashboardSection,
    b2cSection,
    b2bSection,
    blogSection,
    settingsSection,
  ];

  const filtered: NavNode[] = [];

  for (const section of sections) {
    if ("items" in section) {
      // It's a NavSectionConfig
      const filteredSection = filterSection(section, perms);
      if (filteredSection) {
        filtered.push(filteredSection);
      }
    } else {
      // It's a NavItemConfig
      const filteredItem = filterItem(section, perms);
      if (filteredItem) {
        filtered.push(filteredItem);
      }
    }
  }

  return filtered;
}

/**
 * Get badge counts for sidebar items
 * TODO: Replace placeholder queries with actual table queries when schemas are ready
 */

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function getBadgeCounts(): Promise<Record<string, number>> {
  // TODO: Replace these with actual database queries when order/invoice/comment tables exist
  // Example:
  // const b2cOrders = await db.select({ count: count() }).from(b2cOrdersTable).where(...);
  // const b2bOrders = await db.select({ count: count() }).from(b2bOrdersTable).where(...);
  // const b2bInvoices = await db.select({ count: count() }).from(b2bInvoicesTable).where(...);
  // const blogComments = await db.select({ count: count() }).from(blogCommentsTable).where(...);

  return {
    "b2c.orders": 0,
    "b2b.orders": 0,
    "b2b.invoices": 0,
    "blog.comments": 0,
  };
}
