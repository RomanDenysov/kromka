import { Suspense } from "react";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/cards/product-card";
import { GridView } from "@/components/views/grid-view";
import { getFavoriteIds } from "@/lib/favorites/queries";
import type { Product } from "@/lib/queries/products";

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
