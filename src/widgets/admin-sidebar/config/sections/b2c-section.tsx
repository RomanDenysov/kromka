import type { NavSectionConfig } from "../../model/types";

/**
 * B2C navigation section
 */
export const b2cSection: NavSectionConfig = {
  label: "B2C",
  href: "/admin/b2c",
  perm: "b2c.read",
  items: [
    {
      label: "Categories",
      href: "/admin/b2c/categories",
      icon: "Tags",
    },
    {
      label: "Products",
      href: "/admin/b2c/products",
      icon: "Package2",
    },
    {
      label: "Orders",
      href: "/admin/b2c/orders",
      icon: "ShoppingBasket",
      badgeKey: "b2c.orders",
    },
  ],
};
