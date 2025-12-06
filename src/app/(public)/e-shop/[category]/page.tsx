import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductsGrid } from "@/components/products-grid";
import { PageWrapper } from "@/components/shared/container";
import { Spinner } from "@/components/ui/spinner";
import { getCategories, getProductsByCategory } from "@/lib/queries/products";

type Props = {
  params: Promise<{ category: string }>;
};

// Pre-generate all categories
export async function generateStaticParams() {
  const allCategories = await getCategories();
  return allCategories.map((c) => ({ category: c.slug }));
}

async function CategoryPageContent({ params }: Props) {
  const { category } = await params;
  const urlDecoded = decodeURIComponent(category);
  const products = await getProductsByCategory(urlDecoded);

  if (!products) {
    notFound();
  }

  return <ProductsGrid products={products} />;
}

export default function CategoryPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <div className="flex size-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        </PageWrapper>
      }
    >
      <CategoryPageContent params={params} />
    </Suspense>
  );
}
