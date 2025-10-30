import type { NavSectionConfig } from "../../model/types";

/**
 * Settings navigation section
 */
export const settingsSection: NavSectionConfig = {
  label: "Settings",
  href: "/admin/settings",
  perm: "settings.read",
  items: [
    {
      label: "Users",
      href: "/admin/settings/users",
      perm: "users.read",
      icon: "Users2",
    },
    {
      label: "Roles",
      href: "/admin/settings/roles",
      perm: "roles.read",
      icon: "ShieldUser",
    },
    {
      label: "Permissions",
      href: "/admin/settings/permissions",
      perm: "perms.read",
      icon: "ShieldUser",
    },
    {
      label: "Configurations",
      href: "/admin/settings/configurations",
      perm: "config.read",
      icon: "Settings2",
    },
  ],
};

