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

/** Keys of feature count queries — referenced from section.badgeKey in adminConfig. */
export type CounterKey =
  | "activeCarts"
  | "newOrders"
  | "pendingApplications"
  | "pendingComments";

export type ActionId = string;

export interface FilterDef {
  key: string;
  label: string;
  options: readonly string[] | "dynamic";
}

export interface ColumnDef {
  align?: "left" | "right";
  key: string;
  label: string;
  render?: "text" | "status" | "number" | "date" | "money" | "icon";
  sortable?: boolean;
}

export interface TableViewConfig {
  bulkActions?: ActionId[];
  columns: ColumnDef[];
  rowActions: ActionId[];
  view: "table";
}

export interface CardViewConfig {
  badge?: string;
  image?: string;
  title: string;
}

export interface GridViewConfig {
  card: CardViewConfig;
  rowActions: ActionId[];
  view: "grid";
}

export type SectionViewConfig = TableViewConfig | GridViewConfig;

export interface SectionConfig {
  badgeKey?: CounterKey;
  defaultView?: "table" | "grid";
  detail?: boolean;
  entity?: string;
  filters?: FilterDef[];
  label: string;
  primaryAction?: ActionId;
  search?: { fields: string[]; placeholder: string };
  views?: SectionViewConfig[];
}

export interface DomainConfig {
  icon: AdminIconId;
  label: string;
  placement: "main" | "bottom";
  sections: Record<string, SectionConfig>;
}

export type AdminConfig = Record<string, DomainConfig>;

export type SectionQueryFn = (
  params: Record<string, unknown>
) => Promise<unknown[]>;
