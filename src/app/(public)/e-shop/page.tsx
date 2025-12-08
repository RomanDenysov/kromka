import { ProductsGrid } from "@/components/products-grid";
import { getProducts } from "@/lib/queries/products";

export default async function EshopPage() {
  const products = await getProducts();

  return <ProductsGrid products={products} />;
}
