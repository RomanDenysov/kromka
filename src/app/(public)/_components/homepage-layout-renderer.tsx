import { ArrowRight } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { HomepageCtaLink } from "@/components/analytics/homepage-cta-tracked";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { B2BCta } from "@/components/landing/b2b-cta";
import { LoyaltyBanner } from "@/components/landing/loyalty-banner";
import { Container } from "@/components/shared/container";
import { ProductScrollRow } from "@/components/shared/product-scroll-row";
import { PageSection } from "@/components/shared/public-page";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { featureFlags } from "@/config/features";
import { ReorderBar } from "@/features/buy-again-banner/components/reorder-bar";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import type { HomepageResolvedSection } from "@/features/homepage/api/queries";
import { HomeBlogSection } from "@/features/posts/components/home-blog-section";
import { ProductCardSkeleton } from "@/features/products/components/product-card";
import { cn } from "@/lib/utils";
import { BrandStorySection } from "./brand-story-section";
import { HomeHero } from "./home-hero";
import { HomeHeroTypographic } from "./home-hero-typographic";
import { HomepageBlogSkeleton } from "./homepage-blog-skeleton";
import { HomepageStoresSection } from "./homepage-stores-section";
import { HomepageStoresSkeleton } from "./homepage-stores-skeleton";
import { RegistrationBanner } from "./registration-banner";

const CONTAINER_CLASSNAME =
  "my-12 space-y-12 md:my-16 md:space-y-16 xl:my-20 xl:space-y-20";

function CarouselSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-40" />
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="w-[42%] shrink-0 md:w-[22%] lg:w-[18%]"
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            key={index}
          >
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistrationReorderSection() {
  const lastOrderPromise = getLastOrderWithItemsAction();

  return (
    <div className="space-y-4">
      {featureFlags.registrationBanner && (
        <Suspense fallback={null}>
          <RegistrationBanner />
        </Suspense>
      )}
      <Suspense>
        <ReorderBar lastOrderPromise={lastOrderPromise} />
      </Suspense>
    </div>
  );
}

function usesFullWidthLayout(section: HomepageResolvedSection) {
  return (
    section.blockType === "hero" ||
    section.blockType === "blog" ||
    section.blockType === "b2b_cta"
  );
}

function renderCarouselSection(
  section: Extract<HomepageResolvedSection, { blockType: "carousel" }>
) {
  if (section.products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-xl tracking-tight md:text-2xl">
          {section.title}
        </h2>
        <HomepageCtaLink
          carousel_id={section.id}
          carousel_source={section.sourceType}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          cta={
            section.sourceType === "category"
              ? "view_all_category"
              : "view_all_eshop"
          }
          href={section.ctaHref}
          section="homepage_carousel"
        >
          {section.ctaLabel}
          <ArrowRight className="size-3.5" />
        </HomepageCtaLink>
      </div>
      <ProductScrollRow products={section.products} />
    </section>
  );
}

function renderSection(section: HomepageResolvedSection): ReactNode {
  switch (section.blockType) {
    case "hero":
      return featureFlags.typographicHero ? (
        <HomeHeroTypographic />
      ) : (
        <HomeHero />
      );
    case "registration_reorder":
      return (
        <Suspense fallback={null}>
          <RegistrationReorderSection />
        </Suspense>
      );
    case "carousel":
      return (
        <Suspense fallback={<CarouselSkeleton />}>
          {renderCarouselSection(section)}
        </Suspense>
      );
    case "brand_story":
      return <BrandStorySection />;
    case "stores":
      return (
        <Suspense fallback={<HomepageStoresSkeleton />}>
          <HomepageStoresSection />
        </Suspense>
      );
    case "loyalty":
      return <LoyaltyBanner />;
    case "game":
      return (
        <PageSection spacing="md">
          <div className="flex justify-center">
            <GameCardWrapper />
          </div>
        </PageSection>
      );
    case "blog":
      return (
        <Suspense fallback={<HomepageBlogSkeleton />}>
          <HomeBlogSection />
        </Suspense>
      );
    case "b2b_cta":
      return <B2BCta />;
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

interface Props {
  sections: HomepageResolvedSection[];
}

export function HomepageLayoutRenderer({ sections }: Props) {
  const nodes: ReactNode[] = [];
  let containedBuffer: HomepageResolvedSection[] = [];

  const flushContained = () => {
    if (containedBuffer.length === 0) {
      return;
    }

    nodes.push(
      <Container className={CONTAINER_CLASSNAME} key={containedBuffer[0].id}>
        {containedBuffer.map((section) => (
          <div key={section.id}>{renderSection(section)}</div>
        ))}
      </Container>
    );
    containedBuffer = [];
  };

  for (const section of sections) {
    if (usesFullWidthLayout(section)) {
      flushContained();
      nodes.push(<div key={section.id}>{renderSection(section)}</div>);
      continue;
    }

    containedBuffer.push(section);
  }

  flushContained();

  return <>{nodes}</>;
}
