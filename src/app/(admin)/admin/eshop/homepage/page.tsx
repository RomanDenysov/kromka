import type { Route } from "next";
import { Suspense } from "react";
import { getAdminCategories } from "@/features/categories/api/queries";
import { getAdminHomepageSections } from "@/features/homepage/api/queries";
import { getAdminProducts } from "@/features/products/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { HomepageBuilderClient } from "./_components/homepage-builder-client";

async function HomepageBuilderLoader() {
  const [sections, categories, products] = await Promise.all([
    getAdminHomepageSections(),
    getAdminCategories(),
    getAdminProducts(),
  ]);

  return (
    <HomepageBuilderClient
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      }))}
      initialSections={sections}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        isActive: product.isActive,
        showInB2c: product.showInB2c,
        status: product.status,
      }))}
    />
  );
}

export default function HomepageBuilderPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "E-shop", href: "/admin/eshop/stores" },
          { label: "Domovská stránka", href: "/admin/eshop/homepage" as Route },
        ]}
      />
      <section className="h-full flex-1 p-2">
        <Suspense
          fallback={<div className="text-muted-foreground">Načítavanie...</div>}
        >
          <HomepageBuilderLoader />
        </Suspense>
      </section>
    </>
  );
}
