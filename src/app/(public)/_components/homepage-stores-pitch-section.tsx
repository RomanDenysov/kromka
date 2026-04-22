"use client";

import type {
  EmblaCarouselType,
  EmblaEventType,
  EngineType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ChevronRight, Clock, MapPin } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Store } from "@/features/stores/api/queries";
import { STORE_IMAGE_FALLBACK_SRC } from "@/features/stores/constants";
import {
  formatTimeRange,
  getTodaySchedule,
  isCurrentlyOpen,
} from "@/features/stores/lib/store-hours-display";
import { formatStreetCity } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";

const PITCH_AUTOPLAY_DELAY_MS = 6000;
/** Embla scroll animation; higher = slower slide changes. */
const PITCH_SCROLL_DURATION = 45;
/** Parallax strength (Embla tween example pattern). */
const PITCH_PARALLAX_TWEEN_BASE = 0.2;

/** Loop-aware scroll delta for parallax (Embla parallax example). */
function parallaxDiffForSlide(
  engine: EngineType,
  slideIndex: number,
  scrollSnap: number,
  scrollProgress: number,
  diffToTarget: number
): number {
  let diff = diffToTarget;
  if (!engine.options.loop) {
    return diff;
  }
  for (const loopItem of engine.slideLooper.loopPoints) {
    const target = loopItem.target();
    if (slideIndex === loopItem.index && target !== 0) {
      const sign = Math.sign(target);
      if (sign === -1) {
        diff = scrollSnap - (1 + scrollProgress);
      }
      if (sign === 1) {
        diff = scrollSnap + (1 - scrollProgress);
      }
    }
  }
  return diff;
}

interface HomepageStoresPitchSectionProps {
  stores: Store[];
}

export function HomepageStoresPitchSection({
  stores,
}: HomepageStoresPitchSectionProps) {
  const reduceMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const parallaxTweenFactor = useRef(0);
  const parallaxLayerNodes = useRef<HTMLElement[]>([]);

  const plugins = useMemo(() => {
    if (reduceMotion || stores.length <= 1) {
      return undefined;
    }
    return [
      Autoplay({
        delay: PITCH_AUTOPLAY_DELAY_MS,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ];
  }, [reduceMotion, stores.length]);

  const onSelect = useCallback((carousel: CarouselApi | undefined) => {
    if (!carousel) {
      return;
    }
    setActiveIndex(carousel.selectedScrollSnap());
  }, []);

  const setParallaxNodes = useCallback((emblaApi: EmblaCarouselType) => {
    parallaxLayerNodes.current = emblaApi
      .slideNodes()
      .map((slideNode) =>
        slideNode.querySelector<HTMLElement>("[data-pitch-parallax-layer]")
      )
      .filter((node): node is HTMLElement => node !== null);
  }, []);

  const setParallaxTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    parallaxTweenFactor.current =
      PITCH_PARALLAX_TWEEN_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenParallax = useCallback(
    (emblaApi: EmblaCarouselType, evt?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = evt === "scroll";
      const snaps = emblaApi.scrollSnapList();
      const factor = parallaxTweenFactor.current;
      const nodes = parallaxLayerNodes.current;

      for (let snapIndex = 0; snapIndex < snaps.length; snapIndex++) {
        const scrollSnap = snaps[snapIndex];
        const baseDiff = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        for (const slideIndex of slidesInSnap) {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) {
            continue;
          }

          const diff = parallaxDiffForSlide(
            engine,
            slideIndex,
            scrollSnap,
            scrollProgress,
            baseDiff
          );
          const translate = diff * (-1 * factor) * 100;
          const node = nodes[slideIndex];
          if (node) {
            node.style.transform = `translate3d(${translate}%,0,0)`;
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!api) {
      return;
    }
    const handleSelect = () => onSelect(api);
    onSelect(api);
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || reduceMotion) {
      return;
    }

    const handleReinit = (emblaApi: EmblaCarouselType) => {
      setParallaxNodes(emblaApi);
      setParallaxTweenFactor(emblaApi);
      tweenParallax(emblaApi);
    };

    const handleScroll = (emblaApi: EmblaCarouselType, evt: EmblaEventType) => {
      tweenParallax(emblaApi, evt);
    };

    const handleSlideFocus = (emblaApi: EmblaCarouselType) => {
      tweenParallax(emblaApi);
    };

    setParallaxNodes(api);
    setParallaxTweenFactor(api);
    tweenParallax(api);

    api.on("reInit", handleReinit);
    api.on("scroll", handleScroll);
    api.on("slideFocus", handleSlideFocus);

    return () => {
      api.off("reInit", handleReinit);
      api.off("scroll", handleScroll);
      api.off("slideFocus", handleSlideFocus);
      for (const node of parallaxLayerNodes.current) {
        node.style.transform = "";
      }
    };
  }, [
    api,
    reduceMotion,
    setParallaxNodes,
    setParallaxTweenFactor,
    tweenParallax,
  ]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (stores.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-balance font-semibold text-xl tracking-tight md:text-2xl">
          Nase predajne
        </h2>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          href="/predajne"
        >
          Zobraziť všetky
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <Carousel
        aria-label="Naše predajne"
        className="w-full"
        opts={{
          align: "start",
          duration: PITCH_SCROLL_DURATION,
          loop: stores.length > 1,
        }}
        plugins={plugins}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {stores.map((store, slideIndex) => {
            const todaySchedule = getTodaySchedule(store.openingHours);
            const storeOpen = isCurrentlyOpen(todaySchedule);
            return (
              <CarouselItem className="pl-3 md:pl-4" key={store.id}>
                <div className="group/slide relative overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative min-h-[380px] w-full overflow-hidden md:min-h-[460px] lg:min-h-[520px]">
                    <div
                      className="absolute inset-y-0 -left-[10%] h-full w-[120%] max-w-none will-change-transform"
                      data-pitch-parallax-layer
                    >
                      <Image
                        alt={store.name}
                        className="object-cover transition-transform duration-1000 ease-out group-hover/slide:scale-[1.02] motion-reduce:transition-none"
                        fill
                        priority={slideIndex === 0}
                        sizes="(max-width: 768px) 100vw, 1200px"
                        src={store.image?.url ?? STORE_IMAGE_FALLBACK_SRC}
                      />
                    </div>

                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10"
                    />

                    <div className="absolute right-3 bottom-3 left-3 z-10 md:right-auto md:bottom-4 md:left-4 md:w-80">
                      <div className="flex flex-col overflow-hidden rounded-md border bg-background/95 shadow-lg backdrop-blur-sm">
                        <div className="space-y-1 p-3 pb-2">
                          <div className="flex items-start gap-2">
                            <h3 className="text-balance font-semibold text-foreground text-sm leading-snug">
                              {store.name}
                            </h3>
                            <span
                              className={cn(
                                "mt-1 size-2 shrink-0 rounded-full",
                                storeOpen
                                  ? "bg-green-500"
                                  : "bg-muted-foreground/50"
                              )}
                              title={storeOpen ? "Otvorené" : "Zatvorené"}
                            />
                          </div>

                          {store.address ? (
                            <div className="flex items-start gap-1.5 text-foreground/90 text-xs leading-snug">
                              <MapPin
                                aria-hidden
                                className="mt-0.5 size-3 shrink-0"
                              />
                              <span className="text-pretty">
                                {formatStreetCity(store.address)}
                              </span>
                            </div>
                          ) : null}

                          <div className="flex items-center gap-1.5 text-foreground/90 text-xs">
                            <Clock aria-hidden className="size-3 shrink-0" />
                            <span>Dnes: {formatTimeRange(todaySchedule)}</span>
                          </div>
                        </div>

                        <Link
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "group/btn h-auto w-full justify-center gap-1 rounded-none border-border border-t bg-muted/40 py-2.5 font-medium text-foreground text-xs hover:bg-muted/55 hover:text-foreground focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          )}
                          href={`/predajne/${store.slug}` as Route}
                        >
                          Detail predajne
                          <ChevronRight
                            aria-hidden
                            className="size-3 transition-transform duration-500 ease-out group-hover/btn:translate-x-0.5"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {stores.length > 1 ? (
        <nav
          aria-label="Výber predajne"
          className="flex flex-wrap justify-center gap-2"
        >
          {stores.map((store, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`Zobraziť predajňu ${store.name}`}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              key={store.id}
              onClick={() => scrollTo(index)}
              type="button"
            />
          ))}
        </nav>
      ) : null}
    </section>
  );
}
