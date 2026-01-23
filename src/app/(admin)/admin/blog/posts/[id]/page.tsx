import { SaveIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAdminTags, getPostById } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { PostForm } from "../_components/post-form";
import { StatusBadge } from "../_components/status-badge";
import { PostPublishButton } from "./_components/post-publish-button";

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

  return (
    <PostForm
      formId="post-form"
      post={post}
      renderFooter={({ isPending }) => (
        <footer className="sticky inset-x-0 bottom-0 z-10 border-t bg-background">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <StatusBadge size="default" status={post.status} />
              {post.author && (
                <span className="text-muted-foreground text-sm">
                  Autor: {post.author.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PostPublishButton postId={post.id} status={post.status} />
              <Button disabled={isPending} form="post-form" type="submit">
                {isPending ? (
                  <>
                    <Spinner />
                    Ukladanie...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4" />
                    Uložiť
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      )}
      tags={tags}
    />
  );
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
