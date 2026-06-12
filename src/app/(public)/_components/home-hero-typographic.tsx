"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Icons } from "@/components/icons";
import { FadeSpan } from "@/components/motion/fade";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";
import { HOME_HERO_DOM_ID } from "./home-hero-constants";
import { HomeHeroCta } from "./home-hero-cta";

/** Max vertical parallax shift (px) of the type wall while the hero scrolls away. */
const WALL_PARALLAX_PX = 70;

/** Radius (px) around a bread's center inside which it dodges the cursor. */
const POINTER_RADIUS_PX = 280;

/** Max distance (px) a bread shifts away from the cursor. */
const POINTER_MAX_SHIFT_PX = 44;

/** Max extra tilt (deg) while a bread dodges sideways. */
const POINTER_MAX_TILT_DEG = 5;

/** Per-row delay step (s) for the wall slide-in. */
const ROW_STAGGER_S = 0.085;

/** Expo-style ease shared by the one-shot entrances (wall rows, headline rise). */
const ENTRANCE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Content reveal starts once the wall has landed and breads are dropping in. */
const CONTENT_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 1 } },
} as const;

const EYEBROW_VARIANTS = {
  hidden: { opacity: 0, letterSpacing: "0.1em" },
  show: {
    opacity: 1,
    letterSpacing: "0.35em",
    transition: { duration: 0.9, ease: "easeOut" },
  },
} as const;

const HEADLINE_RISE_VARIANTS = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 1, ease: ENTRANCE_EASE } },
} as const;

const WORDMARK_KEYS = ["a", "b", "c", "d"] as const;

/** Wall rows: horizontal stagger + slow horizontal drift (px) in alternating directions. */
const WALL_ROWS = [
  { shift: "-12%", drift: 48, duration: 26 },
  { shift: "-58%", drift: -42, duration: 32 },
  { shift: "-30%", drift: 44, duration: 24 },
  { shift: "-72%", drift: -56, duration: 30 },
  { shift: "-20%", drift: 38, duration: 28 },
  { shift: "-48%", drift: -46, duration: 34 },
] as const;

type WallRowConfig = (typeof WALL_ROWS)[number];

const PHOTOS = [
  {
    src: "/assets/zemiakovy-kvaskovy-chlieb.png",
    alt: "Zemiakový kváskový chlieb",
    width: 612,
    height: 408,
    className: "top-[9%] left-[34%] w-[clamp(180px,32vw,380px)] md:top-[10%]",
    rotate: -4,
    delay: 0.65,
    floatDuration: 5.6,
    parallax: 130,
  },
  {
    src: "/assets/moravsky-kolac-orechovy.png",
    alt: "Moravský koláč orechový",
    // Portrait cutout — the pastry sits in the middle ~55% of the canvas.
    width: 408,
    height: 612,
    className:
      "top-[24%] right-[-6%] w-[clamp(150px,24vw,280px)] md:top-[8%] md:right-[6%]",
    rotate: 6,
    delay: 0.8,
    floatDuration: 6.8,
    parallax: 90,
  },
  {
    src: "/assets/prager-chlieb.png",
    alt: "Kváskový chlieb Prager",
    width: 408,
    height: 612,
    className:
      "bottom-[-8%] left-[-12%] w-[clamp(220px,36vw,420px)] md:bottom-[-14%] md:left-[-3%]",
    rotate: 3,
    delay: 0.95,
    floatDuration: 7.4,
    parallax: 160,
  },
] as const;

type PhotoConfig = (typeof PHOTOS)[number];

function WallRow({
  index,
  reduceMotion,
  row,
}: {
  index: number;
  reduceMotion: boolean;
  row: WallRowConfig;
}) {
  const entranceDelay = 0.05 + index * ROW_STAGGER_S;
  return (
    /* One-shot slide-in from the side the row drifts from; drift loops on the inner div. */
    <motion.div
      animate={reduceMotion ? undefined : { x: 0, opacity: 1 }}
      className="shrink-0"
      initial={
        reduceMotion
          ? false
          : { x: row.drift > 0 ? "-55vw" : "55vw", opacity: 0 }
      }
      transition={{
        delay: entranceDelay,
        duration: 1.1,
        ease: ENTRANCE_EASE,
        opacity: { delay: entranceDelay, duration: 0.35, ease: "easeOut" },
      }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, row.drift] }}
        className="flex shrink-0 items-center gap-[3.5vh] md:gap-[5vh]"
        style={{ marginLeft: row.shift }}
        transition={{
          duration: row.duration,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
        }}
      >
        {WORDMARK_KEYS.map((key) => (
          <Icons.kromka
            className="h-[15vh] w-auto shrink-0 md:h-[21vh]"
            key={key}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function FloatingPhoto({
  photo,
  reduceMotion,
  scrollYProgress,
}: {
  photo: PhotoConfig;
  reduceMotion: boolean;
  scrollYProgress: MotionValue<number>;
}) {
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : photo.parallax]
  );

  const dodgeRef = useRef<HTMLDivElement>(null);
  const dodgeX = useMotionValue(0);
  const dodgeY = useMotionValue(0);
  const springX = useSpring(dodgeX, { stiffness: 160, damping: 17, mass: 0.6 });
  const springY = useSpring(dodgeY, { stiffness: 160, damping: 17, mass: 0.6 });
  const dodgeTilt = useTransform(
    springX,
    [-POINTER_MAX_SHIFT_PX, POINTER_MAX_SHIFT_PX],
    [-POINTER_MAX_TILT_DEG, POINTER_MAX_TILT_DEG]
  );

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const reset = () => {
      dodgeX.set(0);
      dodgeY.set(0);
    };
    // Breads flee the cursor: push away within the radius, settle back outside it.
    // The rect includes the current dodge offset, so a bread can "escape" a chasing
    // cursor until push and spring reach equilibrium.
    const handleMove = (event: MouseEvent) => {
      const el = dodgeRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance === 0 || distance >= POINTER_RADIUS_PX) {
        reset();
        return;
      }
      const push =
        ((1 - distance / POINTER_RADIUS_PX) * POINTER_MAX_SHIFT_PX) / distance;
      dodgeX.set(-dx * push);
      dodgeY.set(-dy * push);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", reset);
    };
  }, [reduceMotion, dodgeX, dodgeY]);

  return (
    <motion.div
      className={cn("absolute z-[5]", photo.className)}
      style={{ y: parallaxY }}
    >
      <motion.div
        ref={dodgeRef}
        style={{ x: springX, y: springY, rotate: dodgeTilt }}
      >
        {/* Toss-in: falls from above with extra spin, spring-settles into its resting tilt. */}
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0, rotate: photo.rotate }}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.08,
                  y: -160,
                  rotate: photo.rotate + 24,
                }
          }
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 13,
            mass: 1.1,
            delay: photo.delay,
            opacity: { delay: photo.delay, duration: 0.3, ease: "easeOut" },
          }}
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [-8, 8] }}
            transition={{
              duration: photo.floatDuration,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }}
          >
            <Image
              alt={photo.alt}
              className="h-auto w-full drop-shadow-[0_30px_45px_rgba(25,22,19,0.3)]"
              height={photo.height}
              priority
              sizes="(min-width: 768px) 32vw, 50vw"
              src={photo.src}
              width={photo.width}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Poster-style hero: a kinetic wall of repeated KROMKA wordmarks with
 * floating bread cutouts. Enabled via `featureFlags.typographicHero`
 * (falls back to the photographic `HomeHero`).
 */
export function HomeHeroTypographic({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const wallY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : WALL_PARALLAX_PX]
  );

  return (
    <section
      className={cn(
        "relative h-dvh w-full overflow-hidden bg-[#f3eee2] text-foreground",
        className
      )}
      id={HOME_HERO_DOM_ID}
      ref={sectionRef}
    >
      <motion.div
        aria-hidden
        className="absolute -inset-x-[6%] inset-y-0 flex flex-col justify-start gap-[1.5vh] [mask-image:linear-gradient(to_bottom,black_55%,rgba(0,0,0,0.4)_78%,transparent_98%)]"
        style={{ y: wallY }}
      >
        {WALL_ROWS.map((row, index) => (
          <WallRow
            index={index}
            key={row.shift}
            reduceMotion={reduceMotion}
            row={row}
          />
        ))}
      </motion.div>

      {/* Soft cream fade behind the fixed header so nav stays readable over the type. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f3eee2] via-[#f3eee2]/70 to-transparent" />

      {PHOTOS.map((photo) => (
        <FloatingPhoto
          key={photo.src}
          photo={photo}
          reduceMotion={reduceMotion}
          scrollYProgress={scrollYProgress}
        />
      ))}

      {/* Sits above the photos (z-6) so breads melt into the page background under the copy. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-2/5 bg-gradient-to-t from-background via-background/50 to-transparent" />

      <motion.div
        animate="show"
        className="absolute inset-x-0 bottom-0 z-10 pb-[max(env(safe-area-inset-bottom),1.5rem)] md:pb-10"
        initial={reduceMotion ? "show" : "hidden"}
        variants={CONTENT_VARIANTS}
      >
        <h1 className="sr-only">
          Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach
        </h1>
        <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex max-w-xl flex-col gap-2">
            {/* Letter-spacing eases open as the eyebrow fades in. */}
            <motion.p
              className="font-semibold text-brand text-xs uppercase"
              variants={EYEBROW_VARIANTS}
            >
              Remeselná pekáreň · Prešov & Košice
            </motion.p>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="block font-extrabold text-4xl text-foreground tracking-tight md:text-5xl"
                variants={HEADLINE_RISE_VARIANTS}
              >
                S láskou ku kvásku.
              </motion.span>
            </span>
            <FadeSpan className="text-pretty text-base text-foreground/70 md:text-lg">
              Kváskový chlieb a koláče z lokálnych surovín, pečené každé ráno.
            </FadeSpan>
          </div>
          <HomeHeroCta animated className="md:shrink-0" variant="surface" />
        </Container>
      </motion.div>
    </section>
  );
}
