"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ProductCard } from "./cards/product-card";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

export function FeaturedCarousel() {
  const trpc = useTRPC();
  const { data: products } = useSuspenseQuery(
    trpc.public.products.list.queryOptions()
  );
  return (
    <Carousel>
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem key={product.id}>
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
