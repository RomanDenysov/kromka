"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

type Product = Awaited<
  ReturnType<typeof import("@/actions/products/queries").getProducts>
>[number];

export function ProductsTable({ products }: { products: Product[] }) {
  const [selectedCategoryId] = useQueryState("categoryId", parseAsString);

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) {
      return products;
    }

    return products.filter((product) =>
      product.categories.some(
        (productCategory) => productCategory.categoryId === selectedCategoryId
      )
    );
  }, [products, selectedCategoryId]);

  return (
    <div className="flex-1 p-4">
      <div className="text-muted-foreground text-sm">
        {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""}
      </div>
      {/* TODO: Implement products table */}
    </div>
  );
}
