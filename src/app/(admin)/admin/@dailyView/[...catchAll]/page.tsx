import type { SearchParams } from "nuqs/server";
import { DailyViewSidebar } from "@/features/daily-view-sidebar/components/daily-view-sidebar";

export default function DailyViewSidebarCatchAllPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <DailyViewSidebar searchParams={searchParams} />;
}
