import { Suspense } from "react";
import { getAdminTags } from "@/features/posts/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";
import { TagsTable } from "./_components/tags-table";

async function TagsLoader() {
  const tags = await getAdminTags();
  return <TagsTable tags={tags} />;
}

export default function BlogTagsPage() {
  return (
    <section className="h-full flex-1">
      <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}>
        <TagsLoader />
      </Suspense>
    </section>
  );
}
