import type { Route } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAdminCategories } from "@/features/categories/api/queries";
import { getHeroBannerById } from "@/features/hero-banners/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { HeroBannerForm } from "../_components/hero-banner-form";

interface Props {
  params: Promise<{ id: string }>;
}

async function EditBannerFormLoader({ params }: Props) {
  const { id } = await params;
  const [banner, categories] = await Promise.all([
    getHeroBannerById(decodeURIComponent(id)),
    getAdminCategories(),
  ]);

  if (!banner) {
    notFound();
  }

  return (
    <HeroBannerForm
      banner={banner}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
    />
  );
}

export default function EditHeroBannerPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Hero bannery", href: "/admin/hero-banners" as Route },
          { label: "Upravit banner" },
        ]}
      />
      <section className="@container/page h-full flex-1 p-4">
        <Suspense
          fallback={
            <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
          }
        >
          <EditBannerFormLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
