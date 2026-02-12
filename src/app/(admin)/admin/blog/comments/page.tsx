import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingComments } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { CommentsQueue } from "./_components/comments-queue";

function CommentsQueueSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            className="space-y-3 rounded-lg border p-4"
            key={`skeleton-${i.toString()}`}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CommentsLoader() {
  const comments = await getPendingComments();
  return <CommentsQueue comments={comments} />;
}

export default function BlogCommentsPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog/posts" },
          { label: "Komentáre" },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <Suspense fallback={<CommentsQueueSkeleton />}>
          <CommentsLoader />
        </Suspense>
      </section>
    </>
  );
}
