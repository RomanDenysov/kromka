import { FeaturedCarousels } from "@/components/featured-carousel";
import { QUERIES } from "@/db/queries/categories";

export default async function FeaturedPage() {
  const featuredCategories = await QUERIES.PUBLIC.GET_FEATURED_CATEGORIES();

  if (featuredCategories.length === 0) {
    return null;
  }

  return <FeaturedCarousels categories={featuredCategories} />;
}
