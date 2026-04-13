import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Objednavka na zajtra",
};

// TODO: Implement tomorrow's order page
// - Products x quantity grid for next day
// - Pre-filled from template (typical day order)
// - +/- stepper for quantities
// - Confirm button with deadline indicator
// - Alert if deadline is approaching and order not confirmed
// - If not confirmed by deadline, template goes as-is

export default function TomorrowOrderPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Objednavka na zajtra</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu budete moct upravit objednavku pre nasledujuci den.
        </p>
      </div>
    </>
  );
}
