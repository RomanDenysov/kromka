import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ProductForm } from "@/app/(admin)/admin/products/[id]/product-form";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getProduct(id: string) {
  "use cache";
  cacheLife("minutes");

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: {
      category: true,
      images: {
        with: {
          media: true,
        },
      },
      prices: {
        with: {
          priceTier: true,
        },
      },
    },
  });
  if (product) {
    product.images = product.images.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...product,
      images: product.images.map((img) => img.media.url),
      category: product.category,
      prices: product.prices.map((p) => ({
        priceCents: p.priceCents,
        priceTier: p.priceTier,
      })),
    };
  }

  return null;
}

async function getCategories() {
  "use cache";
  cacheLife("hours");
  return await db.query.categories.findMany();
}

export type AdminProduct = Awaited<ReturnType<typeof getProduct>>;

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const categories = await getCategories();
  if (!product) {
    return <div>Produkt nebol nájdený</div>;
  }

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: product.name },
        ]}
      />

      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<FormSkeleton />}>
          <ProductForm categories={categories} product={product} />
        </Suspense>
      </section>
    </>
  );
}
