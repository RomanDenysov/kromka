"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_SHIFT_PX = 120;

type UseScrollConfig = NonNullable<Parameters<typeof useScroll>[0]>;

const DEFAULT_SCROLL_OFFSET = [
  "start end",
  "end start",
] as UseScrollConfig["offset"];

export interface ParallaxScrollImageProps {
  alt: string;
  /** Inset for the parallax layer (e.g. negative inset for bleed). */
  bleedClassName?: string;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  maxShiftPx?: number;
  priority?: boolean;
  quality?: number;
  /** Passed to `useScroll` as `offset` — tune per block (e.g. hero vs in-flow). */
  scrollOffset?: UseScrollConfig["offset"];
  sizes: string;
  src: string;
}

export function ParallaxScrollImage({
  src,
  alt,
  sizes,
  quality = 85,
  priority = false,
  className,
  imageClassName,
  bleedClassName = "inset-[-10%]",
  maxShiftPx = DEFAULT_MAX_SHIFT_PX,
  scrollOffset = DEFAULT_SCROLL_OFFSET,
  children,
}: ParallaxScrollImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOffset,
  });
  const maxShift = reduceMotion ? 0 : maxShiftPx;
  const imageY = useTransform(scrollYProgress, [0, 1], [0, maxShift]);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      ref={containerRef}
    >
      <motion.div
        aria-hidden
        className={cn("absolute will-change-transform", bleedClassName)}
        style={{ y: imageY }}
      >
        <Image
          alt={alt}
          className={cn("object-cover", imageClassName)}
          fill
          priority={priority}
          quality={quality}
          sizes={sizes}
          src={src}
        />
      </motion.div>
      {children}
    </div>
  );
}
