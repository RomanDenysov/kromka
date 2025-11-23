import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type SwiperType from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/lib/utils";
import { ProductImage } from "./shared/product-image";

type Props = {
  urls: string[];
  brightness?: boolean;
  disabled?: boolean;
};

export function ImageSlider({
  urls,
  brightness = true,
  disabled = false,
}: Props) {
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [slideConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (urls.length ?? 0) - 1,
  });

  useEffect(() => {
    swiper?.on("slideChange", ({ activeIndex: index }) => {
      setActiveIndex(index);
      setSlideConfig({
        isBeginning: index === 0,
        isEnd: index === (urls.length ?? 0) - 1,
      });
    });
  }, [swiper, urls]);

  const activeStyles =
    "active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square size-9 z-50 place-items-center rounded-full border-2 bg-background border-zinc-300";
  const inactiveStyles = "hidden text-background/80";

  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted shadow-md">
      <div className="absolute inset-0 z-10 opacity-0 transition group-hover:opacity-100">
        <button
          className={cn(
            activeStyles,
            "right-3 transition",
            disabled && "hidden cursor-not-allowed",
            {
              [inactiveStyles]: slideConfig.isEnd,
              "text-background/80 opacity-100 hover:bg-background/50":
                !slideConfig.isEnd,
            }
          )}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            swiper?.slideNext();
          }}
          type="button"
        >
          <ChevronRightIcon className="size-5 text-primary" />
        </button>
        <button
          aria-label="previous image"
          className={cn(
            activeStyles,
            "left-3 transition",
            disabled && "hidden cursor-not-allowed",
            {
              [inactiveStyles]: slideConfig.isBeginning,
              "text-background/80 opacity-100 hover:bg-background/50":
                !slideConfig.isBeginning,
            }
          )}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            swiper?.slidePrev();
          }}
          type="button"
        >
          <ChevronLeftIcon className="size-5 text-primary" />{" "}
        </button>
      </div>
      <Swiper
        className="size-full"
        modules={[Pagination]}
        onSwiper={(s) => setSwiper(s)}
        pagination={{
          renderBullet: (_, className) =>
            `<span class="rounded-full transition ${className}"></span>`,
        }}
        slidesPerView={1}
        spaceBetween={50}
      >
        {urls.map((url, index) => (
          <SwiperSlide
            className="-z-10 relative size-full"
            key={`image-${url}`}
          >
            <ProductImage
              alt={`Product image: ${url}`}
              className={cn(
                "-z-10 size-full object-cover object-center transition-all duration-300",
                !disabled && "md:group-hover:scale-105",
                brightness && "group-hover:brightness-90"
              )}
              decoding="sync"
              height={400}
              loading={index === 0 ? "eager" : "lazy"}
              quality={65}
              src={url}
              width={400}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
