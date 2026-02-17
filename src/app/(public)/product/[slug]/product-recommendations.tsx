import { Suspense } from "react";
import { GridView } from "@/components/grid-view";
import { getFavoriteIds } from "@/features/favorites/api/queries";
import type { Product } from "@/features/products/api/queries";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/features/products/components/product-card";

type Props = {
  recommendations: Product[];
};

async function RecommendationsGrid({ recommendations }: Props) {
  const favoriteIds = await getFavoriteIds();
  const favoriteSet = new Set(favoriteIds);

  return (
    <GridView>
      {recommendations.map((product) => (
        <ProductCard
          isFavorite={favoriteSet.has(product.id)}
          key={product.id}
          product={product}
          source="recommendation"
        />
      ))}
    </GridView>
  );
}

function RecommendationsSkeleton({ count }: { count: number }) {
  return (
    <GridView>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </GridView>
  );
}

export function ProductRecommendations({ recommendations }: Props) {
  return (
    <Suspense
      fallback={<RecommendationsSkeleton count={recommendations.length} />}
    >
      <RecommendationsGrid recommendations={recommendations} />
    </Suspense>
  );
}
