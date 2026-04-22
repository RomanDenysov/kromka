import { GridView } from "@/components/grid-view";
import type { Product } from "@/features/products/api/queries";
import { ProductCard } from "@/features/products/components/product-card";

interface Props {
  recommendations: Product[];
}

export function ProductRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <GridView>
      {recommendations.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          source="recommendation"
        />
      ))}
    </GridView>
  );
}
