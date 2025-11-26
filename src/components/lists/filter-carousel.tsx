"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

type Props = {
  value?: string | null;
  isLoading?: boolean;
  onSelect: (value: string | null) => void;
  data: {
    value: string;
    label: string;
  }[];
};

export function FilterCarousel({ value, isLoading, onSelect, data }: Props) {
  const [api, setAPi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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
        setApi={setAPi}
      >
        <CarouselContent className="-ml-3">
          <CarouselItem className="basis-auto pl-3">
            <Button
              className="cursor-pointer whitespace-nowrap rounded-full"
              onClick={() => onSelect(null)}
              size="sm"
              variant={value === null ? "default" : "secondary"}
            >
              Vsetky
            </Button>
          </CarouselItem>
          {isLoading &&
            Array.from({ length: 12 }).map((_, index) => (
              <CarouselItem
                className="basis-auto pl-3"
                key={`skeleton-${index.toString()}`}
              >
                <Skeleton
                  className={cn(
                    "h-8 w-24 rounded-full px-3",
                    index % 2 === 0 ? "w-18" : "w-20"
                  )}
                />
              </CarouselItem>
            ))}
          {data.map((item) => (
            <CarouselItem className="basis-auto pl-3" key={item.value}>
              <Button
                className="cursor-pointer whitespace-nowrap rounded-full"
                onClick={() => onSelect(item.value)}
                size="sm"
                variant={value === item.value ? "default" : "secondary"}
              >
                {item.label}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
    </div>
  );
}
