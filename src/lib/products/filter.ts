import type { EshopParams } from "@/app/(public)/e-shop/eshop-params";
import type { Product } from "../queries/products";

export function filterProducts(products: Product[], filters: EshopParams) {
  let result = [...products];

  if (filters.q) {
    const query = filters.q.toLowerCase();

    result = result.filter((p) => p.name.toLowerCase().includes(query));
  }

  if (filters.category) {
    result = result.filter((p) => p.category?.slug === filters.category);
  }

  if (filters.sort) {
    switch (filters.sort) {
      case "price_asc":
        result = result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price_desc":
        result = result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "name_asc":
        result = result.sort((a, b) => a.name.localeCompare(b.name, "sk"));
        break;
      case "name_desc":
        result = result.sort((a, b) => b.name.localeCompare(a.name, "sk"));
        break;
      default:
        break;
    }
  }

  const total = result.length;

  return {
    products: result,
    total,
  };
}
