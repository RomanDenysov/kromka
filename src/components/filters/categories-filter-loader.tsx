import { getCategories } from "@/lib/queries/categories";
import { FilterCarousel } from "../lists/filter-carousel";

export async function CategoriesFilterLoader() {
  const categories = await getCategories();
  return <FilterCarousel categories={categories} />;
}
