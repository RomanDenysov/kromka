"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { PageSection } from "@/components/shared/public-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORY_PILLARS = [
  "Kváskový chlieb a pečivo z troch základov: čas, ruka a kvalitné suroviny",
  "Každý deň v Prešove a Košiciach — dôverné miesto pre váš denný bochník",
  "Lokálne mliečne výrobky, párky a nátierky, ktoré dopĺňajú našu ponuku",
] as const;

const fadeContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.12,
    },
  },
} as const;

const fadeItem = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 19,
      mass: 1.2,
    },
  },
} as const;

export function BrandStorySection() {
  return (
    <PageSection
      className="relative overflow-hidden rounded-xl border-border border-t"
      spacing="xl"
      tone="muted"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-brand/20" />

      <motion.div
        className="grid items-start gap-10 md:grid-cols-5 md:gap-12 lg:gap-16"
        initial="hidden"
        variants={fadeContainer}
        viewport={{ amount: 0.2, once: true }}
        whileInView="show"
      >
        {/* Image left (below text on narrow screens) */}
        <motion.div
          className="order-2 md:order-1 md:col-span-2"
          variants={fadeItem}
        >
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-md border bg-muted/30 shadow-sm">
            <Image
              alt="Remeselná pekáreň Kromka — od kvasu po horúce pečivo"
              className="object-cover"
              fill
              sizes="(max-width: 767px) 100vw, 40vw"
              src="/images/o-nas-1.webp"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-amber-950/35 via-transparent to-stone-900/10" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>

        {/* Text right */}
        <motion.div
          className="order-1 flex flex-col gap-6 md:order-2 md:col-span-3"
          variants={fadeItem}
        >
          <div className="space-y-4">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
              S láskou ku kvásku od 2020
            </p>
            <h2 className="text-balance font-bold text-3xl tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Náš
              <br />
              <span className="font-semibold text-brand italic">príbeh</span>
            </h2>
            <p className="max-w-lg text-pretty text-foreground/60 text-lg leading-relaxed">
              Kvasok, múka, voda a soľ. V roku 2020 sme otvorili prvú pobočku v
              Prešove a pečieme každý deň s dôrazom na kvalitné suroviny a
              remeselný postup. Chlieb, lákocinky a káva — piliere pekárne, kde
              sa zastavíte nielen po bochník, ale aj na pohár dobrej kávy.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {STORY_PILLARS.map((line) => (
              <li
                className="flex items-center gap-3 text-foreground/80 text-sm"
                key={line}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Check className="size-3 text-brand" />
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div className="pt-1">
            <Link
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              href="/o-nas"
            >
              Prečítajte si celý príbeh
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </PageSection>
  );
}
