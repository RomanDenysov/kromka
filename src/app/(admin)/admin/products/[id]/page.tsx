import { cache, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { ProductForm } from "@/components/forms/product-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getProduct = cache(async (id: string) => {
  const product = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, id),
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
    product.prices = product.prices.sort((a, b) => a.minQty - b.minQty);

    return {
      ...product,
      images: product.images.map((img) => img.media.url),
      category: product.category,
      prices: product.prices.map((p) => ({
        minQty: p.minQty,
        priceCents: p.priceCents,
        priceTier: p.priceTier,
      })),
    };
  }

  return null;
});

export type AdminProduct = Awaited<ReturnType<typeof getProduct>>;

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return <div>Produkt nebol nájdený</div>;
  }

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: product.name },
        ]}
      />

      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="@container/page h-full flex-1 p-4">
          <Suspense fallback={<FormSkeleton />}>
            <ProductForm product={product} />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
