import type { Metadata, Route } from "next";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { PlaygroundGallery } from "./_components/playground-gallery";
import { PlaygroundSubnav } from "./_components/playground-subnav";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { href: "/admin" as Route, label: "Dashboard" },
          { label: "Playground" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">UI playground</h1>
          <p className="text-muted-foreground text-sm">
            Zbierka komponentov z{" "}
            <span className="font-mono">@/components/ui</span> s ukážkami
            variantov.
          </p>
        </div>
        <PlaygroundSubnav />
        <PlaygroundGallery />
      </div>
    </>
  );
}
