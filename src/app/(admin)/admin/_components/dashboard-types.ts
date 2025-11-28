import type { RouterOutputs } from "@/trpc/routers";

export type RecentOrdersData =
  RouterOutputs["admin"]["dashboard"]["recentOrders"];

export type ActiveCartsData =
  RouterOutputs["admin"]["dashboard"]["activeCarts"];
