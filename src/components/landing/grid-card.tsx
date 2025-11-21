"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type GridCardProps = {
  title: string;
  subtitle?: string;
  href?: Route | null;
  image?: string;
  images?: string[]; // Support multiple images for carousel
  color?: string;
  size?: "small" | "medium" | "large" | "hero";
  className?: string;
  textColor?: string; // Optional text color override
  autoplay?: boolean;
  autoplayDelay?: number;
};

function getCardSizeClasses(size: string) {
  switch (size) {
    case "small":
      return "col-span-1 min-h-[200px]";
    case "medium":
      return "col-span-1 min-h-[280px] md:col-span-2";
    case "large":
      return "col-span-1 min-h-[320px] md:col-span-2 lg:col-span-3";
    case "hero":
      return "col-span-1 min-h-[500px] md:col-span-2 lg:col-span-4 lg:min-h-[600px]";
    default:
      return "";
  }
}

function CarouselControls({
  images,
  currentIndex,
  onScrollTo,
}: {
  images: string[];
  currentIndex: number;
  onScrollTo: (index: number) => void;
}) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: needed to capture click
    // biome-ignore lint/a11y/noStaticElementInteractions: needed to capture click
    <div
      className="absolute top-4 right-4 z-20 flex gap-1.5"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {images.map((imgSrc, index) => (
        <button
          aria-label={`Go to slide ${index + 1}`}
          className={cn(
            "h-2 rounded-full transition-all",
            index === currentIndex
              ? "w-6 bg-white"
              : "w-2 bg-white/50 hover:bg-white/75"
          )}
          key={imgSrc}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onScrollTo(index);
          }}
          type="button"
        />
      ))}
    </div>
  );
}

export function GridCard({
  title,
  subtitle,
  href,
  image,
  images,
  color,
  size = "medium",
  className,
  textColor,
  autoplay = false,
  autoplayDelay = 3000,
}: GridCardProps) {
  // Helper to initialize carousel only if needed
  const plugins = autoplay
    ? [
        Autoplay({
          delay: autoplayDelay,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    plugins
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselImages = images || (image ? [image] : []);
  const hasCarousel = carouselImages.length > 1;
  const hasImage = carouselImages.length > 0;
  const hasSolidColor = !!color && !hasImage;

  // Calculate sizes string for Image component
  let imageSizes = "(max-width: 768px) 100vw, 33vw";
  if (size === "hero") {
    imageSizes = "(max-width: 768px) 100vw, 66vw";
  } else if (size === "large") {
    imageSizes = "(max-width: 768px) 100vw, 50vw";
  }

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) {
        return;
      }
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Sub-render functions to reduce main component complexity
  const renderBackground = () => {
    if (hasImage && hasCarousel) {
      return (
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {carouselImages.map((img, index) => (
              <div className="relative min-w-0 flex-[0_0_100%]" key={img}>
                <Image
                  alt={`${title} - Slide ${index + 1}`}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  fill
                  sizes={imageSizes}
                  src={img || "/placeholder.svg"}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      );
    }

    if (hasImage && !hasCarousel) {
      return (
        <>
          <Image
            alt={title}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            fill
            sizes={imageSizes}
            src={carouselImages[0] || "/placeholder.svg"}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </>
      );
    }

    if (hasSolidColor) {
      return <div className={cn("absolute inset-0", color)} />;
    }

    return null;
  };

  return (
    <Wrapper
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg transition-transform",
        getCardSizeClasses(size),
        className
      )}
      href={href}
    >
      {renderBackground()}

      {hasCarousel && (
        <CarouselControls
          currentIndex={currentIndex}
          images={carouselImages}
          onScrollTo={scrollTo}
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-end p-6 lg:p-8">
        <div className="flex items-end justify-between gap-4">
          <div
            className={cn(
              "space-y-2",
              hasImage && !textColor ? "text-white" : textColor
            )}
          >
            {subtitle && (
              <p className="font-medium text-sm opacity-90">{subtitle}</p>
            )}
            <h3
              className={cn(
                "font-bold leading-tight",
                size === "hero" ? "text-3xl lg:text-5xl" : "text-xl lg:text-2xl"
              )}
            >
              {title}
            </h3>
          </div>

          {/* Arrow in the same container, bottom-left area */}
          {href && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-transform group-hover:translate-x-1",
                hasImage
                  ? "bg-white/20 text-white"
                  : "bg-black/5 text-foreground"
              )}
            >
              <ArrowRight className="size-5" />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

function Wrapper({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href?: Route | null;
  className?: string;
}) {
  if (href) {
    return (
      <Link className={cn(className)} href={href} prefetch>
        {children}
      </Link>
    );
  }
  return <article className={cn(className)}>{children}</article>;
}
