"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories";
import { buttonVariants } from "../ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type Props = {
  categories: Category[];
};

export function FilterCarousel({ categories }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const params = useParams<{ category?: string }>();
  const activeCategory = params.category ?? null;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 left-12 z-10 w-12 bg-linear-to-r from-background to-transparent",
          current === 1 && "hidden"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-12 bottom-0 z-10 w-12 bg-linear-to-l from-background to-transparent",
          current === count && "hidden"
        )}
      />

      <Carousel
        className="w-full px-12"
        opts={{
          align: "start",
          dragFree: true,
        }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3">
          <CarouselItem className="basis-auto pl-3">
            <Link
              className={cn(
                buttonVariants({
                  variant: activeCategory === null ? "default" : "secondary",
                  size: "sm",
                }),
                "cursor-pointer whitespace-nowrap rounded-full"
              )}
              href="/e-shop"
            >
              Všetky
            </Link>
          </CarouselItem>
          {categories.map((category) => (
            <CarouselItem className="basis-auto pl-3" key={category.slug}>
              <Link
                className={cn(
                  buttonVariants({
                    variant:
                      activeCategory === category.slug
                        ? "default"
                        : "secondary",
                    size: "sm",
                  }),
                  "cursor-pointer whitespace-nowrap rounded-full"
                )}
                href={`/e-shop/${category.slug}`}
              >
                {category.name}
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
    </div>
  );
}
