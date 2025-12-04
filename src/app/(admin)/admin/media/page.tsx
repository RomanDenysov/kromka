import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { MediaList } from "@/components/lists/media";

export default function MediaPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Médiá", href: "/admin/media" },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <Suspense fallback={<div>Loading media...</div>}>
          <MediaList />
        </Suspense>
      </section>
    </>
  );
}
