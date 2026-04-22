"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  analytics,
  type HomepageCtaClickPayload,
  type HomepageCtaId,
  type HomepageCtaSection,
} from "@/lib/analytics";

type TrackedLinkBase = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: ComponentProps<typeof Link>["href"];
  section: HomepageCtaSection;
  cta: HomepageCtaId;
  variant?: HomepageCtaClickPayload["variant"];
  store_slug?: string;
};

function hrefToString(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") {
    return href;
  }
  try {
    return JSON.stringify(href);
  } catch {
    return "[href]";
  }
}

/** Next.js `Link` that emits `homepage cta clicked` on navigate. */
export function HomepageCtaLink({
  section,
  cta,
  href,
  variant,
  store_slug,
  ...linkProps
}: TrackedLinkBase) {
  const handleClick = () => {
    analytics.homepageCtaClicked({
      section,
      cta,
      href: hrefToString(href),
      ...(variant === undefined ? {} : { variant }),
      ...(store_slug === undefined ? {} : { store_slug }),
    });
  };

  return <Link {...linkProps} href={href} onClick={handleClick} />;
}

type TrackedAnchorBase = Omit<ComponentProps<"a">, "href" | "onClick"> & {
  href: string;
  section: HomepageCtaSection;
  cta: HomepageCtaId;
  variant?: HomepageCtaClickPayload["variant"];
  store_slug?: string;
};

/** Plain anchor (e.g. external) that emits `homepage cta clicked`. */
export function HomepageCtaExternalLink({
  section,
  cta,
  href,
  variant,
  store_slug,
  ...anchorProps
}: TrackedAnchorBase) {
  const handleClick = () => {
    analytics.homepageCtaClicked({
      section,
      cta,
      href,
      ...(variant === undefined ? {} : { variant }),
      ...(store_slug === undefined ? {} : { store_slug }),
    });
  };

  return <a {...anchorProps} href={href} onClick={handleClick} />;
}
