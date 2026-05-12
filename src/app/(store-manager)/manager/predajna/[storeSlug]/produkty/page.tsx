import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Produkty",
};

// TODO: Implement product availability page
// - List of products available for this store
// - Toggle availability per product (on/off for this store)
// - Search/filter by name or category
// - Show current stock if Dotykacka integrated

export default function ProductsPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">Produkty</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Tu budete moct spravovat dostupnost produktov pre vasu predajnu.
        </p>
      </div>
    </>
  );
}
