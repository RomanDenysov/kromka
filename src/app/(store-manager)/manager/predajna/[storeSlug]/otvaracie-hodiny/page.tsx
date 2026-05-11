import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Otvaracie hodiny",
};

// TODO: Implement opening hours management page
// - Weekly schedule grid (Mon-Sun with time ranges)
// - Exception dates (holidays, special closures)
// - Save button with cache invalidation (updateTag("stores"))

export default function OpeningHoursPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Otvaracie hodiny</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu budete moct upravit otvaracie hodiny vasej predajne.
        </p>
      </div>
    </>
  );
}
