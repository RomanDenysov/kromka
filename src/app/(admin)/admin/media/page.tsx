import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { ImageUpload } from "@/components/image-upload";
import { MediaList } from "@/components/lists/media";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function MediaPage() {
  prefetch(trpc.admin.media.list.queryOptions());
  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Médiá", href: "/admin/media" },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <ErrorBoundary fallback={<div>Error loading media</div>}>
          <Suspense fallback={<div>Loading media...</div>}>
            <MediaList />
          </Suspense>
        </ErrorBoundary>
        <ImageUpload productId="1" />
      </section>
    </HydrateClient>
  );
}
