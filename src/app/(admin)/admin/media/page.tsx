import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ImageUpload } from "@/components/image-upload";
import { MediaList } from "@/components/lists/media";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function MediaPage() {
  prefetch(trpc.admin.media.list.queryOptions());
  return (
    <section>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error loading media</div>}>
          <Suspense fallback={<div>Loading media...</div>}>
            <MediaList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
      <ImageUpload productId="1" />
    </section>
  );
}
