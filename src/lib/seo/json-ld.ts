import type {
  Article,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  LocalBusiness,
  Offer,
  OpeningHoursSpecification,
  Organization,
  Product,
  Review,
  WebSite,
  WithContext,
} from "schema-dts";
import { formatISO } from "date-fns";
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
    description:
      "Remeselná pekáreň na východnom Slovensku. Pečieme kváskový chlieb, pečivo a koláče z kvalitných surovín podľa tradičných receptov.",
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
    areaServed: {
      "@type": "Place",
      name: "Východné Slovensko",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ponuka pekárenských výrobkov",
      url: getSiteUrl("/e-shop"),
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
// Review Schema
// ============================================================================

type ReviewSchemaInput = {
  authorName: string;
  rating: number;
  reviewBody?: string | null;
  datePublished: Date;
  productName: string;
  productSlug: string;
};

export function getReviewSchema(
  review: ReviewSchemaInput
): WithContext<Review> {
  const schema: WithContext<Review> = {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.authorName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    datePublished: formatISO(review.datePublished),
    itemReviewed: {
      "@type": "Product",
      name: review.productName,
      url: getSiteUrl(`/product/${review.productSlug}`),
    },
  };

  if (review.reviewBody) {
    schema.reviewBody = review.reviewBody;
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
    priceRange: "€",
    servesCuisine: "Pekárenské výrobky, Chlieb, Pečivo",
    paymentAccepted: "Hotovosť, Platobná karta",
    currenciesAccepted: "EUR",
    hasMenu: `${SITE_URL}/e-shop`,
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 48.72,
        longitude: 21.26,
      },
      geoRadius: "100000",
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
    schema.datePublished = formatISO(post.publishedAt);
  }

  if (post.updatedAt) {
    schema.dateModified = formatISO(post.updatedAt);
  }

  return schema;
}

// ============================================================================
// CollectionPage Schema (for product listing pages)
// ============================================================================

export function getCollectionPageSchema(): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Naše Produkty",
    description:
      "Ponuka tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý chlieb, pečivo, koláče a ďalšie špeciality.",
    url: getSiteUrl("/e-shop"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
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

// ============================================================================
// FAQPage Schema
// ============================================================================

export type FAQItem = {
  question: string;
  answer: string;
};

export function getFAQSchema(items: FAQItem[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };
}
