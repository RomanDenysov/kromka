import { getContextRailOpen } from "@/features/daily-view-sidebar/cookies";
import { DashboardDateChip } from "./dashboard-date-chip";

export async function DashboardDateChipLoader() {
  const defaultRailOpen = await getContextRailOpen();

  return <DashboardDateChip defaultRailOpen={defaultRailOpen} />;
}
