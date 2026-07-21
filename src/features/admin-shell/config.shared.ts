import type { AdminConfig, DomainConfig, SectionConfig } from "./types";

export const adminConfig = {
  eshop: {
    label: "E-shop",
    icon: "store",
    placement: "main",
    sections: {
      stores: {
        label: "Predajne",
        entity: "store",
        defaultView: "table",
        views: [
          {
            view: "table",
            columns: [
              { key: "name", label: "Názov", sortable: true },
              { key: "isActive", label: "Stav", render: "status" },
            ],
            rowActions: ["store.toggleActive", "store.edit", "store.delete"],
          },
          {
            view: "grid",
            card: { title: "name", badge: "isActive" },
            rowActions: ["store.toggleActive", "store.edit"],
          },
        ],
        search: {
          placeholder: "Hľadať predajne...",
          fields: ["name"],
        },
        filters: [
          {
            key: "isActive",
            label: "Stav",
            options: ["all", "true", "false"],
          },
        ],
        primaryAction: "store.create",
        detail: true,
      },
      categories: { label: "Kategórie" },
      products: { label: "Produkty" },
      homepage: { label: "Domovská stránka" },
      orders: { label: "Objednávky", badgeKey: "newOrders" },
      carts: { label: "Košíky", badgeKey: "activeCarts" },
    },
  },
  blog: {
    label: "Blog",
    icon: "newspaper",
    placement: "main",
    sections: {
      posts: { label: "Články" },
      tags: { label: "Štítky" },
      comments: { label: "Komentáre", badgeKey: "pendingComments" },
    },
  },
  b2b: {
    label: "B2B",
    icon: "briefcase",
    placement: "main",
    sections: {
      applications: { label: "Žiadosti", badgeKey: "pendingApplications" },
      clients: { label: "Klienti" },
      "price-tiers": { label: "Cenové skupiny" },
      invoices: { label: "Faktúry" },
    },
  },
  production: {
    label: "Výroba",
    icon: "factory",
    placement: "main",
    sections: {
      recipes: { label: "Recepty" },
      ingredients: { label: "Suroviny" },
    },
  },
  reports: {
    label: "Reporty",
    icon: "chart-column",
    placement: "main",
    sections: {
      products: { label: "Ziskovosť produktov" },
      stores: { label: "Ziskovosť predajní" },
    },
  },
  system: {
    label: "Systém",
    icon: "settings",
    placement: "bottom",
    sections: {
      users: { label: "Používatelia" },
      media: { label: "Médiá" },
      activity: { label: "Aktivita" },
      settings: { label: "Nastavenia" },
    },
  },
  playground: {
    label: "Playground",
    icon: "flask-conical",
    placement: "bottom",
    sections: {},
  },
} as const satisfies AdminConfig;

export type AdminDomainSlug = keyof typeof adminConfig;

export type DomainWithSlug = DomainConfig & { slug: string };

export function getDomainHref(slug: string): `/admin/${string}` {
  return `/admin/${slug}`;
}

export function getSectionHref(
  domainSlug: string,
  sectionSlug: string
): `/admin/${string}` {
  return `/admin/${domainSlug}/${sectionSlug}`;
}

export function getDomain(slug: string): DomainWithSlug | undefined {
  const domain = adminConfig[slug as AdminDomainSlug];
  if (!domain) {
    return;
  }
  return { ...domain, slug };
}

export function listDomains(options?: {
  placement?: DomainConfig["placement"];
}): DomainWithSlug[] {
  const domains = Object.entries(adminConfig).map(([slug, domain]) => ({
    ...domain,
    slug,
  }));
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

  return Object.entries(domain.sections).map(([sectionSlug, section]) => ({
    href: getSectionHref(domain.slug, sectionSlug),
    label: section.label,
    badgeKey: section.badgeKey,
  }));
}
