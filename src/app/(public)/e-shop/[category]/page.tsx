import { notFound } from "next/navigation";
import { ProductsGrid } from "@/components/products-grid";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";

type Props = {
  params: Promise<{ category: string }>;
};

// Pre-generate all categories
export async function generateStaticParams() {
  const allCategories = await getCategories();
  return allCategories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPageContent({ params }: Props) {
  const { category } = await params;
  const products = await getProducts();

  const filtered = category
    ? products.filter((p) => p.category?.slug === category)
    : products;

  if (!filtered) {
    notFound();
  }

  return <ProductsGrid products={filtered} />;
}
