export type AdminSidebarBadgeKey =
  | "activeCarts"
  | "newOrders"
  | "pendingApplications"
  | "pendingComments";

export interface AdminSidebarBadges {
  activeCarts: number;
  newOrders: number;
  pendingApplications: number;
  pendingComments: number;
}
