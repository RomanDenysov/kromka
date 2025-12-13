"use client";

import { useQueryStates } from "nuqs";
import { dashboardSearchParams } from "@/app/(admin)/admin/(dashboard)/dashboard-search-params";

export const useDashboardParams = () =>
  useQueryStates(dashboardSearchParams, {
    shallow: false,
  });
