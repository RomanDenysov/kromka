"use client";

import { useQueryStates } from "nuqs";
import { dashboardSearchParams } from "@/features/daily-view-sidebar/search-params";

export const useDashboardParams = () =>
  useQueryStates(dashboardSearchParams, {
    shallow: false,
  });
