import type { NavSectionConfig } from "../../model/types";

/**
 * B2B navigation section
 */
export const b2bSection: NavSectionConfig = {
  label: "B2B",
  href: "/admin/b2b",
  perm: "b2b.read",
  items: [
    {
      label: "Orders",
      href: "/admin/b2b/orders",
      icon: "ShoppingBasket",
      badgeKey: "b2b.orders",
    },
    {
      label: "Companies",
      href: "/admin/b2b/companies",
      icon: "Building2",
    },
    {
      label: "Products",
      href: "/admin/b2b/products",
      icon: "Package2",
    },
    {
      label: "Invoices",
      href: "/admin/b2b/invoices",
      icon: "FileText",
      badgeKey: "b2b.invoices",
    },
  ],
};

