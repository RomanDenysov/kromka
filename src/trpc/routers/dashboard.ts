import z from "zod";
import {
  getActiveCarts,
  getDashboardMetrics,
  getRecentOrders,
} from "@/db/queries/dashboard";
import { createTRPCRouter, roleProcedure } from "../init";

export const adminDashboardRouter = createTRPCRouter({
  metrics: roleProcedure("admin").query(
    async () => await getDashboardMetrics()
  ),

  recentOrders: roleProcedure("admin")
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => await getRecentOrders(input?.limit)),

  activeCarts: roleProcedure("admin")
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => await getActiveCarts(input?.limit)),
});
