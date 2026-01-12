import type {
  Article,
  BreadcrumbList,
  LocalBusiness,
  Offer,
  OpeningHoursSpecification,
  Organization,
  Product,
  WebSite,
  WithContext,
} from "schema-dts";
import type { Address, StoreSchedule } from "@/db/types";
import { getSiteUrl } from "@/lib/utils";

const SITE_NAME = "Pekáreň Kromka";
const SITE_URL = "https://www.pekarenkromka.sk";

// ============================================================================
// Organization Schema
// ============================================================================

export function getOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: getSiteUrl("/icons/icon-512x512.png"),
    sameAs: [
      "https://www.instagram.com/pekaren.kromka",
      "https://www.facebook.com/pekaren.kromka",
      "https://zkromky.substack.com",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "kromka@kavejo.sk",
      contactType: "customer service",
      availableLanguage: ["Slovak"],
    },
  };
}

// ============================================================================
// WebSite Schema with SearchAction
// ============================================================================

export function getWebSiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/e-shop?q={search_term_string}`,
      },
      // @ts-expect-error - query-input is valid schema.org property not in schema-dts
      "query-input": "required name=search_term_string",
    },
  };
}

// ============================================================================
// Product Schema
// ============================================================================

type ProductSchemaInput = {
  name: string;
  description: string;
  image?: string | null;
  priceCents: number;
  slug: string;
  category?: string | null;
  isAvailable?: boolean;
  rating?: {
    value: number;
    count: number;
  } | null;
};

export function getProductSchema(
  product: ProductSchemaInput
): WithContext<Product> {
  const offer: Offer = {
    "@type": "Offer",
    price: (product.priceCents / 100).toFixed(2),
    priceCurrency: "EUR",
    availability: product.isAvailable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: getSiteUrl(`/product/${product.slug}`),
  };

  const schema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: getSiteUrl(`/product/${product.slug}`),
    offers: offer,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };

  if (product.image) {
    schema.image = product.image;
  }

  if (product.category) {
    schema.category = product.category;
  }

  if (product.rating && product.rating.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.value.toFixed(1),
      reviewCount: product.rating.count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

// ============================================================================
// LocalBusiness (Bakery) Schema
// ============================================================================

type StoreSchemaInput = {
  name: string;
  description?: string | null;
  slug: string;
  address?: Address | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  openingHours?: StoreSchedule | null | undefined;
  image?: string | null;
};

const DAY_MAPPING = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
} as const;

export function transformOpeningHours(
  schedule: StoreSchedule | null | undefined
): OpeningHoursSpecification[] {
  if (!schedule?.regularHours) {
    return [];
  }

  const specifications: OpeningHoursSpecification[] = [];

  for (const [day, hours] of Object.entries(schedule.regularHours)) {
    const dayKey = day as keyof typeof DAY_MAPPING;
    if (
      hours &&
      hours !== "closed" &&
      typeof hours === "object" &&
      dayKey in DAY_MAPPING
    ) {
      specifications.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_MAPPING[dayKey],
        opens: hours.start,
        closes: hours.end,
      });
    }
  }

  return specifications;
}

function parseCoordinate(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isNaN(num) ? null : num;
}

export function getLocalBusinessSchema(
  store: StoreSchemaInput
): WithContext<LocalBusiness> {
  const schema: WithContext<LocalBusiness> = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: store.name,
    url: getSiteUrl(`/predajne/${store.slug}`),
    parentOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (store.description) {
    schema.description = store.description;
  }

  if (store.image) {
    schema.image = store.image;
  }

  if (store.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: store.address.street,
      addressLocality: store.address.city,
      postalCode: store.address.postalCode,
      addressCountry: store.address.country ?? "SK",
    };
  }

  const lat = parseCoordinate(store.latitude);
  const lng = parseCoordinate(store.longitude);
  if (lat !== null && lng !== null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    };
  }

  if (store.phone) {
    schema.telephone = store.phone;
  }

  if (store.email) {
    schema.email = store.email;
  }

  const openingHours = transformOpeningHours(store.openingHours);
  if (openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours;
  }

  return schema;
}

// ============================================================================
// BlogPosting (Article) Schema
// ============================================================================

type BlogPostSchemaInput = {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
};

export function getBlogPostingSchema(
  post: BlogPostSchemaInput
): WithContext<Article> {
  const schema: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: getSiteUrl(`/blog/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: getSiteUrl("/icons/icon-512x512.png"),
      },
    },
  };

  if (post.description) {
    schema.description = post.description;
  }

  if (post.image) {
    schema.image = post.image;
  }

  if (post.authorName) {
    schema.author = {
      "@type": "Person",
      name: post.authorName,
      image: post.authorImage ?? undefined,
    };
  }

  if (post.publishedAt) {
    schema.datePublished = post.publishedAt.toISOString();
  }

  if (post.updatedAt) {
    schema.dateModified = post.updatedAt.toISOString();
  }

  return schema;
}

// ============================================================================
// BreadcrumbList Schema
// ============================================================================

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function getBreadcrumbSchema(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Domov",
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: item.name,
        item: item.href ? getSiteUrl(item.href) : undefined,
      })),
    ],
  };
}
