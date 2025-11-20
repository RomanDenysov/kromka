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

type SectionName = "hero" | "features" | "statistics" | "cta" | "contact";

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
  features: {
    main: {
      image: "/images/breads.jpg",
      title: "Čo vám ponúkame",
      description:
        "Objavte všetky služby a možnosti, ktoré pre vás máme pripravené",
    },
  },
  statistics: {
    main: {
      image: "/images/breads.jpg",
      title: "Statistiky",
      description:
        "Objavte všetky služby a možnosti, ktoré pre vás máme pripravené",
    },
  },
  cta: {
    main: {
      image: "/images/breads.jpg",
      title: "Kontakt",
      description:
        "Objavte všetky služby a možnosti, ktoré pre vás máme pripravené",
    },
  },
  contact: {
    main: {
      image: "/images/breads.jpg",
      title: "Kontakt",
      description:
        "Objavte všetky služby a možnosti, ktoré pre vás máme pripravené",
    },
  },
};
