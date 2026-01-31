import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAdminTags, getPostById } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { PostFormContainer } from "./_components/post-form-container";

type Props = {
  params: Promise<{ id: string }>;
};

async function PostFormLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [post, tags] = await Promise.all([
    getPostById(decodedId),
    getAdminTags(),
  ]);

  if (!post) {
    notFound();
  }

  return <PostFormContainer post={post} tags={tags} />;
}

export default function AdminPostEditorPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Články", href: "/admin/blog/posts" },
          { label: "Upraviť článok" },
        ]}
      />

      <section className="@container/page h-full flex-1">
        <Suspense fallback={<FormSkeleton className="p-6" rows={8} />}>
          <PostFormLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
