import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Product } from "@/features/products/api/queries";
import { ProductCard } from "@/features/products/components/product-card";

interface Props {
  products: Product[];
}

export function ProductScrollRow({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
        containScroll: "trimSnaps",
      }}
    >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            className="basis-[42%] md:basis-[22%] lg:basis-[18%]"
            key={product.id}
          >
            <ProductCard product={product} source="homepage" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
