import type { NavSectionConfig } from "../../model/types";

/**
 * Blog navigation section
 */
export const blogSection: NavSectionConfig = {
  label: "Blog",
  href: "/admin/blog",
  perm: "blog.read",
  items: [
    {
      label: "Posts",
      href: "/admin/blog/posts",
      icon: "BookA",
    },
    {
      label: "Tags",
      href: "/admin/blog/tags",
      icon: "Tags",
    },
    {
      label: "Comments",
      href: "/admin/blog/comments",
      icon: "MessageCircle",
      badgeKey: "blog.comments",
    },
    {
      label: "Settings",
      href: "/admin/blog/settings",
      perm: "settings.read",
      icon: "Settings",
    },
  ],
};

