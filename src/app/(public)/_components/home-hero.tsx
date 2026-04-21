"use client";

import { ArrowRight, MapPin } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOME_HERO_DOM_ID } from "./home-hero-constants";

/** Static homepage hero — copy and imagery are versioned in code, not CMS. */
const HOME_HERO = {
  heading: "S láskou ku kvásku",
  imageUrl: "/images/pecivo-test.webp",
  primaryCta: { label: "Objednať online", href: "/e-shop" as const },
  secondaryCta: { label: "Naše predajne", href: "/predajne" as const },
} as const;

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
          src={HOME_HERO.imageUrl}
        />
      </motion.div>

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

      <div className="justify-end-safe absolute inset-0 z-10 flex flex-col items-center gap-6 p-6 px-6 md:justify-center md:gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-balance text-center font-bold text-5xl text-shadow-2xs text-white tracking-tight md:text-6xl">
            {HOME_HERO.heading}
          </h1>
          <p className="text-balance text-center font-medium text-lg text-shadow-2xs text-white tracking-tight md:text-xl lg:text-2xl">
            Chlieb z pece, závin z rúk, káva z lásky
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:justify-center md:gap-4">
          <Link
            className={cn(
              buttonVariants({ variant: "glass", size: "xl" }),
              "group w-full justify-center md:w-auto"
            )}
            href={HOME_HERO.primaryCta.href}
          >
            {HOME_HERO.primaryCta.label}
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "link", size: "xl" }),
              "group min-h-11 w-full justify-center text-white no-underline transition-colors duration-200 ease-out hover:no-underline active:text-white/90 motion-reduce:duration-0 md:w-auto md:hover:text-white/80"
            )}
            href={HOME_HERO.secondaryCta.href}
          >
            <MapPin className="size-3.5" />
            {HOME_HERO.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
