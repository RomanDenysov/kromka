import type { RouterOutputs } from "@/trpc/routers";
import { FeaturedProductCard } from "./cards/featured-product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

export type FeaturedCategory =
  RouterOutputs["public"]["categories"]["featured"][number];

type FeaturedCarouselsProps = {
  categories: FeaturedCategory[];
};

export function FeaturedCarousels({ categories }: FeaturedCarouselsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <FeaturedCarousel category={category} key={category.id} />
      ))}
    </div>
  );
}

type FeaturedCarouselProps = {
  category: FeaturedCategory;
};

function FeaturedCarousel({ category }: FeaturedCarouselProps) {
  return (
    <section className="min-h-60 shrink-0" data-featured-category={category.id}>
      <h2 className="mb-4 font-bold text-2xl">{category.name}</h2>
      <div className="relative">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
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
      </div>
    </section>
  );
}

export function FeaturedCarouselSkeleton() {
  return (
    <div className="min-h-60 shrink-0">
      <Skeleton className="mb-3 h-8 w-40" />
      <div className="h-50 w-full rounded-md">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    </div>
  );
}
