"use client";

import { MenuIcon } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { HOME_HERO_DOM_ID } from "./home-hero-constants";
import { navigation } from "./navigation";

interface Props {
  cartSlot: ReactNode;
  className?: string;
}

export function Header({ className, cartSlot }: Props) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isPastHomeHero, setIsPastHomeHero] = useState(false);
  const { scrollY } = useScroll();

  const updatePastHero = useCallback(() => {
    if (pathname !== "/") {
      setIsPastHomeHero(false);
      return;
    }
    const hero = document.getElementById(HOME_HERO_DOM_ID);
    const headerEl = headerRef.current;
    if (!(hero && headerEl)) {
      return;
    }
    const headerBottom = headerEl.getBoundingClientRect().bottom;
    const heroBottom = hero.getBoundingClientRect().bottom;
    setIsPastHomeHero(heroBottom <= headerBottom);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", updatePastHero);

  useLayoutEffect(() => {
    updatePastHero();
    if (pathname !== "/") {
      return;
    }
    window.addEventListener("resize", updatePastHero);
    return () => window.removeEventListener("resize", updatePastHero);
  }, [pathname, updatePastHero]);

  let positionShell: string;
  if (pathname !== "/") {
    positionShell = "sticky border-b bg-background";
  } else if (isPastHomeHero) {
    positionShell = "fixed border-b bg-background text-foreground shadow-xs";
  } else {
    positionShell =
      "fixed border-b-0 border-transparent bg-transparent text-shadow-2xs text-white drop-shadow-lg";
  }

  return (
    <header
      className={cn(
        "top-0 z-40 w-full pt-[env(safe-area-inset-top)] transition-[background-color,border-color,box-shadow,color,text-shadow] duration-200 ease-out motion-reduce:duration-0",
        positionShell,
        className
      )}
      data-layout-header
      ref={headerRef}
    >
      <Container>
        <div className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-5">
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
          <DesktopNav />

          {/* Logo */}
          <Link className="flex items-center justify-center" href="/">
            <Icons.kromka className="h-4 lg:h-5" />
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 xl:gap-3">
            <UserButton />
            {cartSlot}
          </div>
        </div>
      </Container>
    </header>
  );
}
