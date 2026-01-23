import { Suspense } from "react";
import { getAdminTags } from "@/features/posts/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";
import { TagsTable } from "./_components/tags-table";

async function TagsLoader() {
  const tags = await getAdminTags();
  return <TagsTable tags={tags} />;
}

export default function BlogTagsPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Štítky" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense
          fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
        >
          <TagsLoader />
        </Suspense>
      </section>
    </>
  );
}
