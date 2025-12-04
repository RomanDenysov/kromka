import { cache, Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ProductsTable } from "@/components/tables/products/table";
import { db } from "@/db";

const getProducts = cache(async () => {
  const fetchedProducts = await db.query.products.findMany({
    with: {
      category: true,
      prices: {
        with: {
          priceTier: true,
        },
      },
      images: {
        with: {
          media: true,
        },
      },
    },
    orderBy: (product, { desc }) => desc(product.createdAt),
  });

  for (const p of fetchedProducts) {
    p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const processedProducts = fetchedProducts.map((p) => ({
    ...p,
    images: p.images.map((img) => img.media.url),
    category: p.category,
    prices: p.prices.map((pt) => ({
      priceCents: pt.priceCents,
      priceTier: pt.priceTier,
    })),
  }));

  return processedProducts;
});

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <ProductsTable products={products} />
        </Suspense>
      </section>
    </>
  );
}
