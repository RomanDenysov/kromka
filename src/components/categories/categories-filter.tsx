import { getCategories } from "@/lib/queries/categories";
import { CategoryLink } from "./category-link";

export async function SimpleCategoriesFilter() {
  "use cache";
  const categories = await getCategories();

  return (
    <div className="flex flex-wrap gap-1">
      <CategoryLink label="Všetky" slug={null} />
      {categories.map((category) => (
        <CategoryLink
          key={category.id}
          label={category.name}
          slug={category.slug}
        />
      ))}
    </div>
  );
}
