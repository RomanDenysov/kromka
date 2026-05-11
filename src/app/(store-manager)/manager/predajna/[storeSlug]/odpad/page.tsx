import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Odpad / straty",
};

// TODO: Implement waste & losses page
// - Daily write-off form: product list with quantity input
// - Reason selector per item: unsold, damaged, expired
// - Submit button with date
// - History view of past write-offs
// - Takes 2-3 minutes to fill out (designed for end of day)

export default function WastePage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Odpad / straty</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu budete moct zaznamenat denne odpisy a straty.
        </p>
      </div>
    </>
  );
}
