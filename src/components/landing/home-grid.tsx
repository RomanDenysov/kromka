import type { Route } from "next";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { homepageConfig } from "@/config/homepage";
import { GridCard, type GridCardProps } from "./grid-card";

// Helper to combine props with feature flag check
type GridItemConfig = GridCardProps & {
  id: string;
  requiresFlag?: keyof typeof featureFlags;
};

// Define the entire homepage grid layout here
const gridItems: GridItemConfig[] = [
  // --- HERO (Large) ---
  {
    id: "hero-main",
    title: homepageConfig.hero.main.title || "S láskou ku kvásku",
    subtitle: "V Kromke to vonia čerstvým kváskovým chlebom",
    image: homepageConfig.hero.main.image,
    size: "hero",
    // Can override spans via className if needed, but 'hero' size handles defaults
  },

  // --- CTA / Action (Medium) ---
  {
    id: "hero-cta",
    title: homepageConfig.hero.cta.link?.label || "Prejsť na eshop",
    subtitle: "Objednajte si online a vyzdvihnite na predajni",
    href: homepageConfig.hero.cta.link?.href,
    image: homepageConfig.hero.cta.image,
    size: "medium",
  },

  // --- Seasonal (Medium) ---
  {
    id: "seasonal",
    title: "Vianočná ponuka",
    subtitle: "Tradičné koláče na váš stôl",
    href: "/eshop" as Route,
    image: "/images/christmas-compain.jpg",
    size: "medium",
  },

  // --- B2B (Medium with carousel potential) ---
  {
    id: "b2b",
    requiresFlag: "b2b",
    title: "B2B Spolupráca",
    subtitle: "Dodávame pre kaviarne a hotely",
    href: "/b2b",
    images: ["/images/b2b-1.webp", "/images/breads.jpg"], // Example carousel
    size: "medium",
  },

  // --- Blog (Medium) ---
  {
    id: "blog",
    requiresFlag: "blog",
    title: "Magazín",
    subtitle: "Recepty, tipy a novinky",
    href: "/blog",
    image: "/images/blog.jpg",
    size: "medium",
  },

  // --- Stores (Medium) ---
  {
    id: "stores",
    requiresFlag: "stores",
    title: "Naše predajne",
    subtitle: "Kde nás nájdete v Košiciach a Prešove",
    href: "/predajne",
    image: "/images/stores.jpg",
    size: "medium",
  },

  // --- Statistics (Small/Medium Cards) ---
  {
    id: "stat-1",
    title: "12,000+",
    subtitle: "Upečených chlebov mesačne",
    href: "/eshop" as Route,
    color: "bg-muted",
    size: "small",
    textColor: "text-foreground",
  },
  {
    id: "stat-2",
    title: "5,000+",
    subtitle: "Spokojných zákazníkov",
    href: "/eshop" as Route,
    color: "bg-muted",
    size: "small",
    textColor: "text-foreground",
  },
  {
    id: "stat-3",
    title: "8",
    subtitle: "Rokov na trhu",
    href: "/eshop" as Route,
    color: "bg-muted",
    size: "small",
    textColor: "text-foreground",
  },

  // --- Join Us (Medium/Large) ---
  {
    id: "join-us",
    title: "Pridajte sa",
    subtitle: "Staňte sa súčasťou nášho tímu",
    href: "/kontakt" as Route,
    color: "bg-zinc-900",
    size: "medium",
    textColor: "text-white",
  },
];

export function HomeGrid() {
  const visibleItems = gridItems.filter((item) => {
    if (item.requiresFlag) {
      return featureFlags[item.requiresFlag];
    }
    return true;
  });

  return (
    <section className="w-full py-6 md:py-10">
      <Container>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {visibleItems.map((item) => (
            <GridCard key={item.id} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
