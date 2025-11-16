import type { NavSectionConfig } from "../../model/types";

/**
 * B2B navigation section
 */
export const b2bSection: NavSectionConfig = {
  label: "B2B",
  href: "/admin",
  perm: "b2b.read",
  items: [
    {
      label: "Companies",
      href: "/admin/invoices",
      icon: "Building2",
    },
    {
      label: "Invoices",
      href: "/admin/invoices",
      icon: "FileText",
      badgeKey: "b2b.invoices",
    },
  ],
};
