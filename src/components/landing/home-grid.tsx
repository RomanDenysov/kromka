import type { Route } from "next";
import { GridCard, type GridItemConfig } from "@/components/grid-card";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { homepageConfig } from "@/config/homepage";

// Define the entire homepage grid layout
const gridItems: GridItemConfig[] = [
  // Hero
  {
    id: "hero-main",
    title: homepageConfig.hero.main.title || "S láskou ku kvásku",
    subtitle: "V Kromke to vonia čerstvým kváskovým chlebom",
    image: homepageConfig.hero.main.image,
    size: "hero",
  },

  // CTA
  {
    id: "hero-cta",
    title: homepageConfig.hero.cta.link?.label || "Prejsť na eshop",
    subtitle: "Objednajte si online a vyzdvihnite na predajni",
    href: homepageConfig.hero.cta.link?.href,
    image: homepageConfig.hero.cta.image,
    size: "medium",
  },

  // Seasonal
  {
    id: "seasonal",
    title: "Vianočná ponuka",
    subtitle: "Tradičné koláče na váš stôl",
    href: "/eshop" as Route,
    image: "/images/christmas-compain.jpg",
    size: "medium",
  },

  // B2B (with carousel)
  {
    id: "b2b",
    requiresFlag: "b2b",
    title: "B2B Spolupráca",
    subtitle: "Dodávame pre kaviarne a hotely",
    href: "/b2b",
    images: ["/images/b2b-1.webp", "/images/breads.jpg"],
    size: "medium",
  },

  // Blog
  {
    id: "blog",
    requiresFlag: "blog",
    title: "Magazín",
    subtitle: "Recepty, tipy a novinky",
    href: "/blog",
    image: "/images/blog.jpg",
    size: "medium",
  },

  // Stores
  {
    id: "stores",
    requiresFlag: "stores",
    title: "Naše predajne",
    subtitle: "Kde nás nájdete v Košiciach a Prešove",
    href: "/predajne",
    image: "/images/stores.jpg",
    size: "medium",
  },

  // Statistics
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

  // Join Us
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

// Filter items based on feature flags - happens on server
function getVisibleItems(): GridItemConfig[] {
  return gridItems.filter((item) => {
    if (item.requiresFlag) {
      return featureFlags[item.requiresFlag as keyof typeof featureFlags];
    }
    return true;
  });
}

export function HomeGrid() {
  const visibleItems = getVisibleItems();

  return (
    <section className="w-full pt-5 pb-6 md:pb-10">
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
