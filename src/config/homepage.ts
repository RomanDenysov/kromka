import type { Route } from "next";

type Config = Record<
  string,
  {
    image: string;
    title?: string;
    description?: string;
    link?: {
      label: string;
      href: Route;
    };
  }
>;

// Only 'hero' is currently used in the new grid layout
type SectionName = "hero";

type PageConfig = Record<SectionName, Config>;

export const homepageConfig: PageConfig = {
  hero: {
    main: {
      image: "/images/velka-noc.jpeg",
      title: "S láskou ku kvásku",
      description:
        "V Kromke to vonia čerstvým kváskovým chlebom, koláčmi a kávou, a teraz sme aj online! Vitajte na našom eshope, veríme, že si nájdete lakocinky podľa svojej chuti.",
    },
    cta: {
      image: "/images/sortiment-warm.jpg",
      link: {
        label: "Prejsť na eshop",
        href: "/eshop",
      },
    },
  },
};
