"use client";

import { ArrowRight, MapPin, MenuIcon } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigation } from "./navigation";

interface HomeHeroProps {
  actions: ReactNode;
}

const SCROLL_RANGE: [number, number] = [0, 300];

export function HomeHero({ actions }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const prefersReduced = useReducedMotion();

  const { scrollY } = useScroll();

  // Logo: transforms from hero-center to header position
  const logoScale = useTransform(scrollY, SCROLL_RANGE, [8, 1]);
  const logoY = useTransform(scrollY, SCROLL_RANGE, ["40vh", "0vh"]);

  // Background parallax
  const imageY = useTransform(scrollY, [0, 1000], ["0%", "-10%"]);

  // Extra darkening on scroll
  const overlayOpacity = useTransform(scrollY, [0, 1000], [0, 0.2]);

  // Header bg transition via IntersectionObserver
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Fixed header - transparent -> solid on scroll */}
      <header
        className={cn(
          "fixed top-0 z-50 w-full pt-[env(safe-area-inset-top)] transition-colors duration-300",
          scrolled
            ? "bg-background text-foreground"
            : "bg-transparent text-white"
        )}
      >
        <Container>
          <div className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-14 md:gap-5">
            {/* Navigation */}
            <Suspense
              fallback={
                <Button
                  aria-label="Otvoriť menu"
                  className="md:hidden"
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <MenuIcon className="size-5" />
                </Button>
              }
            >
              <MobileNavigation navigation={navigation} />
            </Suspense>
            <nav className="hidden grow items-center justify-start gap-2 md:flex">
              {navigation.map((item) => (
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    !scrolled && "hover:bg-white/10 hover:text-white"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logo - animated from hero-center to header */}
            <motion.div
              className="flex items-center justify-center"
              style={
                prefersReduced
                  ? undefined
                  : { scale: logoScale, y: logoY, originX: 0.5, originY: 0.5 }
              }
            >
              <Link
                className={cn(
                  "transition-opacity",
                  !scrolled && "pointer-events-none"
                )}
                href="/"
                tabIndex={scrolled ? 0 : -1}
              >
                <Icons.kromka className="h-4 lg:h-5" />
              </Link>
            </motion.div>

            {/* Actions */}
            {actions}
          </div>
        </Container>
      </header>

      {/* Fullscreen hero section */}
      <section
        className="relative h-svh w-full overflow-hidden bg-black"
        id="home-hero"
        ref={heroRef}
      >
        {/* Parallax background image */}
        <motion.div
          className="absolute inset-x-0 -top-[10%] bottom-0 h-[120%]"
          style={prefersReduced ? undefined : { y: imageY }}
        >
          <Image
            alt="Cerstvé pecivo z pekárne Kromka"
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="/images/easter-hero.webp"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

        {/* Extra darkening on scroll */}
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: prefersReduced ? 0 : overlayOpacity }}
        />

        {/* Subtitle */}
        <div className="absolute inset-x-0 bottom-28 z-10 flex flex-col items-center px-6 md:bottom-32">
          <p className="text-white/70 text-xs uppercase tracking-[0.25em] md:text-sm">
            Remeseln&#225; pek&#225;re&#328;
          </p>
        </div>

        {/* CTAs */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-4 px-6 md:bottom-10">
          <Link
            className={cn(buttonVariants({ variant: "glass" }), "group")}
            href="/e-shop"
          >
            Objednat online
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "text-white/60 no-underline hover:text-white hover:no-underline"
            )}
            href="/predajne"
          >
            <MapPin className="size-3.5" />
            Nase predajne
          </Link>
        </div>
      </section>
    </>
  );
}
