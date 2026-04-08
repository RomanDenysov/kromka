import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { heroBanners } from "@/db/schema";

const DEFAULT_HERO = {
  image: "/images/easter-hero.webp",
  heading: undefined,
  subtitle: "Remeselna pekaren",
  ctaLabel: "Objednat online",
  ctaHref: "/e-shop",
} as const;

export async function getActiveHeroBanner() {
  "use cache";
  cacheLife("hours");
  cacheTag("hero-banners");

  const banner = await db.query.heroBanners.findFirst({
    where: eq(heroBanners.isActive, true),
    with: { image: true },
  });

  if (!banner) {
    return {
      id: null,
      imageUrl: DEFAULT_HERO.image,
      heading: DEFAULT_HERO.heading,
      subtitle: DEFAULT_HERO.subtitle,
      ctaLabel: DEFAULT_HERO.ctaLabel,
      ctaHref: DEFAULT_HERO.ctaHref,
    };
  }

  return {
    id: banner.id,
    imageUrl: banner.image?.url ?? DEFAULT_HERO.image,
    heading: banner.heading ?? DEFAULT_HERO.heading,
    subtitle: banner.subtitle ?? DEFAULT_HERO.subtitle,
    ctaLabel: banner.ctaLabel ?? DEFAULT_HERO.ctaLabel,
    ctaHref: banner.ctaHref ?? DEFAULT_HERO.ctaHref,
  };
}

export function getHeroBanners() {
  return db.query.heroBanners.findMany({
    with: { image: true },
    orderBy: [desc(heroBanners.updatedAt)],
  });
}

export type HeroBannerRow = Awaited<ReturnType<typeof getHeroBanners>>[number];

export function getHeroBannerById(id: string) {
  return db.query.heroBanners.findFirst({
    where: eq(heroBanners.id, id),
    with: { image: true },
  });
}
