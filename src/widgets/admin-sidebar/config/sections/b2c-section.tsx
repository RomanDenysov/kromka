import type { NavSectionConfig } from "../../model/types";

/**
 * B2C navigation section
 */
export const b2cSection: NavSectionConfig = {
  label: "B2C",
  href: "/admin",
  perm: "b2c.read",
  items: [
    {
      label: "Categories",
      href: "/admin/categories",
      icon: "Tags",
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: "Package2",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: "ShoppingBasket",
      badgeKey: "b2c.orders",
    },
  ],
};
