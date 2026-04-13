import type { Route } from "next";
import { Suspense } from "react";
import { getAdminCategories } from "@/features/categories/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { HeroBannerForm } from "../_components/hero-banner-form";

async function NewBannerFormLoader() {
  const categories = await getAdminCategories();

  return (
    <HeroBannerForm
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
    />
  );
}

export default function NewHeroBannerPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Hero bannery", href: "/admin/hero-banners" as Route },
          { label: "Novy banner" },
        ]}
      />
      <section className="@container/page h-full flex-1 p-4">
        <Suspense
          fallback={
            <div className="text-muted-foreground text-sm">Nacitavanie...</div>
          }
        >
          <NewBannerFormLoader />
        </Suspense>
      </section>
    </>
  );
}
