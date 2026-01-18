import Image from "next/image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMedia } from "@/features/media-library/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

async function MediaLoader() {
  const media = await getMedia();
  return media.map((item) => (
    <div
      className="relative aspect-square overflow-hidden rounded-md bg-muted"
      key={item.id}
    >
      <Image
        alt={item.name}
        className="aspect-square size-full object-cover"
        height={160}
        src={item.url}
        width={160}
      />
    </div>
  ));
}

export default function MediaPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Médiá", href: "/admin/media" },
        ]}
      />
      <section className="grid h-full flex-1 grid-cols-2 gap-4 p-4 md:grid-cols-4 xl:grid-cols-6">
        <Suspense
          fallback={
            <>
              <Skeleton className="aspect-square size-full" />
              <Skeleton className="aspect-square size-full" />
              <Skeleton className="aspect-square size-full" />
              <Skeleton className="aspect-square size-full" />
            </>
          }
        >
          <MediaLoader />
        </Suspense>
      </section>
    </>
  );
}
