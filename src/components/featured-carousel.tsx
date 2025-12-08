import { cacheLife } from "next/cache";
import {
  type FeaturedCategory,
  getFeaturedCategories,
} from "@/lib/queries/products";
import { FeaturedProductCard } from "./cards/featured-product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

export async function FeaturedCarousel() {
  "use cache";
  cacheLife("hours");
  const categories = await getFeaturedCategories();
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <FeaturedSection category={category} key={category.slug} />
      ))}
    </div>
  );
}

function FeaturedSection({ category }: { category: FeaturedCategory }) {
  return (
    <section className="min-h-60 shrink-0">
      <h2 className="mb-4 font-bold text-2xl">{category.name}</h2>
      <Carousel className="w-full" opts={{ align: "start", loop: true }}>
        <CarouselContent className="-ml-4 pb-4">
          {category.products.map((product) => (
            <CarouselItem
              className="basis-1/2 pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              key={product.id}
            >
              <FeaturedProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 transition-opacity disabled:opacity-0" />
        <CarouselNext className="right-4 transition-opacity disabled:opacity-0" />
      </Carousel>
    </section>
  );
}
