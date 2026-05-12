import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "QR sken vyzdvihnutia",
};

// TODO: Implement QR scanner page
// - Camera-based QR code scanner (html5-qrcode or react-qr-reader)
// - Scans customer's QR -> opens order detail
// - Shows: order number, items, total, payment status
// - If paid online -> confirm handover button
// - If pay in store -> select payment type (cash/card) -> confirm
// - Manual order number input as fallback

export default function QrScanPage() {
  return (
    <>
      <header className="flex h-(--header-height) items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold text-lg">QR sken vyzdvihnutia</h1>
      </header>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">
          Naskenujte QR kod zakaznika pre vyzdvihnutie objednavky.
        </p>
      </div>
    </>
  );
}
