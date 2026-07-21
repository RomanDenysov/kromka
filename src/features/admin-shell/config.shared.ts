import type { AdminConfig, DomainConfig, SectionConfig } from "./types";

export const adminConfig = {
  eshop: {
    label: "E-shop",
    slug: "eshop",
    icon: "store",
    placement: "main",
    panel: "eshop.panel",
    sections: {
      stores: {
        label: "Predajne",
        slug: "stores",
        icon: "store",
      },
      categories: {
        label: "Kategórie",
        slug: "categories",
        icon: "tags",
      },
      products: {
        label: "Produkty",
        slug: "products",
        icon: "package",
      },
      homepage: {
        label: "Domovská stránka",
        slug: "homepage",
        icon: "layout-template",
      },
      orders: {
        label: "Objednávky",
        slug: "orders",
        icon: "clipboard-list",
        badgeKey: "newOrders",
      },
      carts: {
        label: "Košíky",
        slug: "carts",
        icon: "shopping-cart",
        badgeKey: "activeCarts",
      },
    },
  },
  blog: {
    label: "Blog",
    slug: "blog",
    icon: "newspaper",
    placement: "main",
    sections: {
      posts: {
        label: "Články",
        slug: "posts",
        icon: "newspaper",
      },
      tags: {
        label: "Štítky",
        slug: "tags",
        icon: "tags",
      },
      comments: {
        label: "Komentáre",
        slug: "comments",
        icon: "message-square",
        badgeKey: "pendingComments",
      },
    },
  },
  b2b: {
    label: "B2B",
    slug: "b2b",
    icon: "briefcase",
    placement: "main",
    sections: {
      applications: {
        label: "Žiadosti",
        slug: "applications",
        icon: "file-text",
        badgeKey: "pendingApplications",
      },
      clients: {
        label: "Klienti",
        slug: "clients",
        icon: "briefcase",
      },
      "price-tiers": {
        label: "Cenové skupiny",
        slug: "price-tiers",
        icon: "wallet",
      },
      invoices: {
        label: "Faktúry",
        slug: "invoices",
        icon: "file-text",
      },
    },
  },
  production: {
    label: "Výroba",
    slug: "production",
    icon: "factory",
    placement: "main",
    sections: {
      recipes: {
        label: "Recepty",
        slug: "recipes",
        icon: "chef-hat",
      },
      ingredients: {
        label: "Suroviny",
        slug: "ingredients",
        icon: "wheat",
      },
    },
  },
  reports: {
    label: "Reporty",
    slug: "reports",
    icon: "chart-column",
    placement: "main",
    sections: {
      products: {
        label: "Ziskovosť produktov",
        slug: "products",
        icon: "trending-up",
      },
      stores: {
        label: "Ziskovosť predajní",
        slug: "stores",
        icon: "trending-up",
      },
    },
  },
  system: {
    label: "Systém",
    slug: "system",
    icon: "settings",
    placement: "bottom",
    sections: {
      users: {
        label: "Používatelia",
        slug: "users",
        icon: "users",
      },
      media: {
        label: "Médiá",
        slug: "media",
        icon: "images",
      },
      activity: {
        label: "Aktivita",
        slug: "activity",
        icon: "activity",
      },
      settings: {
        label: "Nastavenia",
        slug: "settings",
        icon: "settings",
      },
    },
  },
  playground: {
    label: "Playground",
    slug: "playground",
    icon: "flask-conical",
    placement: "bottom",
    sections: {},
  },
} as const satisfies AdminConfig;

export type AdminConfigData = typeof adminConfig;
export type AdminDomainSlug = keyof AdminConfigData;

export function getDomainHref(slug: string): `/admin/${string}` {
  return `/admin/${slug}`;
}

export function getSectionHref(
  domainSlug: string,
  sectionSlug: string
): `/admin/${string}` {
  return `/admin/${domainSlug}/${sectionSlug}`;
}

export function getDomain(slug: string): DomainConfig | undefined {
  return adminConfig[slug as AdminDomainSlug];
}

export function getDomainSections(slug: string): SectionConfig[] {
  const domain = getDomain(slug);
  if (!domain) {
    return [];
  }
  return Object.values(domain.sections);
}

export function listDomains(options?: {
  placement?: DomainConfig["placement"];
}): DomainConfig[] {
  const domains = Object.values(adminConfig);
  if (!options?.placement) {
    return domains;
  }
  return domains.filter((domain) => domain.placement === options.placement);
}

export interface SectionTab {
  badgeKey?: SectionConfig["badgeKey"];
  href: `/admin/${string}`;
  label: string;
}

export function getSectionTabs(domainSlug: string): SectionTab[] {
  const domain = getDomain(domainSlug);
  if (!domain) {
    return [];
  }

  return getDomainSections(domainSlug).map((section) => ({
    href: getSectionHref(domain.slug, section.slug),
    label: section.label,
    badgeKey: section.badgeKey,
  }));
}
