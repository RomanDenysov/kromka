"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { FeaturedProductCard } from "./cards/featured-product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface FeaturedCarouselProps {
  categoryId: string;
  categoryName: string;
}

export function FeaturedCarousel({
  categoryId,
  categoryName,
}: FeaturedCarouselProps) {
  const trpc = useTRPC();
  const { data: products } = useSuspenseQuery(
    trpc.public.products.featured.queryOptions({ categoryId })
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 font-bold text-2xl">{categoryName}</h2>
      <div className="relative">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4 pb-4">
            {products.map((product) => (
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
