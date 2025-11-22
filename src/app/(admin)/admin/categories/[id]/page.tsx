import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoryForm } from "@/components/forms/category-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.admin.categories.byId.queryOptions({ id }));
  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
          { label: "Upraviť kategóriu" },
        ]}
      />
      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="@container/page h-full flex-1 p-4">
          <Suspense fallback={<FormSkeleton className="@md/page:max-w-md" />}>
            <CategoryForm id={id} />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
