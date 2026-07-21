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
  | "shopping-bag"
  | "shopping-cart"
  | "store"
  | "tags"
  | "trending-up"
  | "users"
  | "wallet"
  | "wheat";

export type ActionId = string;

export type CounterId = string;

export type PanelId = string;

export interface FilterDef<T> {
  key: keyof T & string;
  label: string;
  options: readonly string[] | "dynamic";
}

export interface ColumnDef<T> {
  align?: "left" | "right";
  key: keyof T & string;
  label: string;
  render?: "text" | "status" | "number" | "date" | "money" | "icon";
  sortable?: boolean;
}

export interface TableViewConfig<T> {
  bulkActions?: ActionId[];
  columns: ColumnDef<T>[];
  rowActions: ActionId[];
  view: "table";
}

export interface CardViewConfig<T> {
  badge?: keyof T & string;
  image: keyof T & string;
  title: keyof T & string;
}

export interface GridViewConfig<T> {
  card: CardViewConfig<T>;
  rowActions: ActionId[];
  view: "grid";
}

/** Forward-looking list UI config — optional until the table/grid PR. */
export interface SectionListConfig<T = unknown> {
  counter?: CounterId;
  defaultView?: "table" | "grid";
  detail?: boolean;
  entity?: string;
  filters?: FilterDef<T>[];
  primaryAction?: ActionId;
  search?: { placeholder: string; fields: (keyof T & string)[] };
  views?: Array<TableViewConfig<T> | GridViewConfig<T>>;
}

export type SectionConfig<T = unknown> = SectionListConfig<T> & {
  label: string;
  slug: string;
  icon?: AdminIconId;
  badgeKey?: AdminSidebarBadgeKey;
};

export interface DomainConfig {
  icon: AdminIconId;
  label: string;
  panel?: PanelId;
  placement: "main" | "bottom";
  sections: Record<string, SectionConfig>;
  slug: string;
}

export type AdminConfig = Record<string, DomainConfig>;

export interface AdminServerBindings {
  counters: Partial<Record<AdminSidebarBadgeKey, () => Promise<number>>>;
}
