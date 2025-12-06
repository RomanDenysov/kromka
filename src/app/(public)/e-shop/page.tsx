import { ProductsGrid } from "@/components/products-grid";
import { getProducts } from "@/lib/queries/products";

export default async function EshopPage() {
  const products = await getProducts();

  return <ProductsGrid products={products} />;
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
