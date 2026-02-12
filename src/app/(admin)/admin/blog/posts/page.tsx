import { Suspense } from "react";
import { getAdminPosts } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";
import { PostsTable } from "./_components/posts-table";

async function PostsLoader() {
  const { posts } = await getAdminPosts({});
  return <PostsTable posts={posts} />;
}

export default function BlogPostsPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog/posts" },
          { label: "Články" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense
          fallback={<DataTableSkeleton columnCount={8} rowCount={10} />}
        >
          <PostsLoader />
        </Suspense>
      </section>
    </>
  );
}
