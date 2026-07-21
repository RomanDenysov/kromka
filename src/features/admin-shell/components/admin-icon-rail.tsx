import MainSidebar from "@/widgets/admin-sidebar/main-sidebar";
import { getNavBadgeCountsByHref } from "../config.server";

/** Server icon rail: resolves counters from serverBindings, then hydrates the client sidebar. */
export async function AdminIconRail() {
  const counts = await getNavBadgeCountsByHref();
  return <MainSidebar counts={counts} />;
}
