import "server-only";

import { cache } from "react";
import {
  getCartsCount,
  getOrdersCount,
} from "@/features/admin-dashboard/api/queries";
import { getPendingApplicationsCount } from "@/features/b2b/applications/api/queries";
import { getPendingCommentsCount } from "@/features/posts/api/queries";
import type { CounterKey } from "./types";

const counterQueries: Record<CounterKey, () => Promise<number>> = {
  newOrders: getOrdersCount,
  activeCarts: getCartsCount,
  pendingComments: getPendingCommentsCount,
  pendingApplications: getPendingApplicationsCount,
};

/** Fetch a single admin nav counter by key (deduped per request). */
export const getCounter = cache(
  async (key: CounterKey): Promise<number> => counterQueries[key]()
);
