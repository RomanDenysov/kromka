"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { FadeContainer, FadeSpan } from "@/components/motion/fade";
import { cn } from "@/lib/utils";
import { HOME_HERO_DOM_ID } from "./home-hero-constants";
import { HomeHeroCta } from "./home-hero-cta";

/** Max vertical parallax shift (px) while the hero scrolls past the viewport. */
const PARALLAX_MAX_SHIFT_PX = 160;

export function HomeHero({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const maxShift = reduceMotion ? 0 : PARALLAX_MAX_SHIFT_PX;
  const imageY = useTransform(scrollYProgress, [0, 1], [0, maxShift]);

  return (
    <section
      className={cn(
        "relative h-dvh w-full overflow-hidden bg-black",
        className
      )}
      id={HOME_HERO_DOM_ID}
      ref={sectionRef}
    >
      <motion.div
        aria-hidden
        className="absolute inset-[-8%] will-change-transform"
        style={{ y: imageY }}
      >
        <Image
          alt="Čerstvé pečivo z pekárne Kromka"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/images/pecivo-test.webp"
        />
      </motion.div>

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

      <FadeContainer className="justify-end-safe absolute inset-0 z-10 flex flex-col items-center gap-6 p-6 px-6 md:justify-center md:gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-balance text-center font-bold text-5xl text-shadow-2xs text-white tracking-tight md:text-6xl">
            <FadeSpan>S láskou</FadeSpan> <FadeSpan>ku kvásku</FadeSpan>
          </h1>
          <p className="text-balance text-center font-medium text-lg text-shadow-2xs text-white tracking-tight md:text-xl lg:text-2xl">
            <FadeSpan>Chlieb z pece,</FadeSpan>{" "}
            <FadeSpan>závin z rúk,</FadeSpan> <FadeSpan>káva z lásky</FadeSpan>
          </p>
        </div>
        <HomeHeroCta animated variant="overlay" />
      </FadeContainer>
    </section>
  );
}
