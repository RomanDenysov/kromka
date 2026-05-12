import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Prehlad predajne",
};

// TODO: Implement store overview / P&L dashboard
// - Revenue vs costs this week/month
// - Write-off rate trends
// - Ordered vs sold vs written-off over time
// - Daily/weekly/monthly toggle
// - Key metrics cards: revenue, costs, margin, write-off rate

export default function StoreOverviewPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Prehlad predajne</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu sa budu zobrazovat metriky a prehlad predajne.
        </p>
      </div>
    </>
  );
}
