import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getPostById } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

type Props = {
  params: Promise<{ id: string }>;
};

async function PostFormLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const post = await getPostById(decodedId);

  if (!post) {
    notFound();
  }

  // TODO: Implement post editor form (Task 2.3)
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 font-semibold text-xl">{post.title}</h2>
      <p className="text-muted-foreground">
        Status: {post.status} | Author: {post.author?.name ?? "Unknown"}
      </p>
      <p className="mt-2 text-muted-foreground text-sm">
        Post editor form will be implemented in Task 2.3
      </p>
    </div>
  );
}

export default function AdminPostEditorPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Clanky", href: "/admin/blog/posts" },
          { label: "Upravit clanok" },
        ]}
      />

      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<FormSkeleton />}>
          <PostFormLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
