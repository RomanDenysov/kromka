import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Objednavky na vyzdvihnutie",
};

// TODO: Implement pickup orders view
// - Status summary cards (cakaju na potvrdenie, pripravuje sa, na vyzdvihnutie, vydane dnes)
// - Today/Tomorrow toggle tabs
// - Order cards with: order number, time, customer name, items, payment badge, price, action button
// - Color-coded left border by status (red=waiting, blue=preparing, green=ready)
// - Action buttons: Potvrdit, Pripravena, Vydat (QR)
// - Completed orders show "Vydana HH:MM" timestamp

export default function PickupOrdersPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Objednavky na vyzdvihnutie</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu sa budu zobrazovat objednavky na vyzdvihnutie pre dnesny den.
        </p>
      </div>
    </>
  );
}
