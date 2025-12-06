import { notFound } from "next/navigation";
import { ProductsGrid } from "@/components/products-grid";
import {
  getAllCategories,
  getProductsByCategory,
} from "@/lib/queries/products";

type Props = {
  params: Promise<{ category: string }>;
};

// Pre-generate всі категорії
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const products = await getProductsByCategory(category);

  if (!products) {
    notFound();
  }

  return <ProductsGrid products={products} />;
}
