import { type Permission, ROLE_PERMS } from "@/lib/auth/rbac";
import { adminNavigation } from "../config/navigation";
import type { NavItemConfig, NavNode, NavSectionConfig } from "./types";

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
export function getFilteredNav(role: string | undefined): NavNode[] {
  if (!role) {
    return [];
  }

  const perms = new Set(ROLE_PERMS[role] ?? []);
  const filtered: NavNode[] = [];

  for (const node of adminNavigation) {
    if ("items" in node) {
      // It's a NavSectionConfig
      const filteredSection = filterSection(node, perms);
      if (filteredSection) {
        filtered.push(filteredSection);
      }
    } else {
      // It's a NavItemConfig
      const filteredItem = filterItem(node, perms);
      if (filteredItem) {
        filtered.push(filteredItem);
      }
    }
  }

  return filtered;
}
