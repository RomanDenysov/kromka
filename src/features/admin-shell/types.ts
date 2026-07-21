import type { AdminSidebarBadgeKey } from "@/features/admin-sidebar/badge-types";

export type AdminIconId =
  | "activity"
  | "briefcase"
  | "chart-column"
  | "chef-hat"
  | "clipboard-list"
  | "factory"
  | "file-text"
  | "flask-conical"
  | "images"
  | "layout-template"
  | "message-square"
  | "newspaper"
  | "package"
  | "settings"
  | "shopping-cart"
  | "store"
  | "tags"
  | "trending-up"
  | "users"
  | "wallet"
  | "wheat";

export interface SectionConfig {
  badgeKey?: AdminSidebarBadgeKey;
  label: string;
}

export interface DomainConfig {
  icon: AdminIconId;
  label: string;
  placement: "main" | "bottom";
  sections: Record<string, SectionConfig>;
}

export type AdminConfig = Record<string, DomainConfig>;
