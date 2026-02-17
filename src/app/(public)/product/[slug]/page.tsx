import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Hint } from "@/components/shared/hint";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts, type Product } from "@/features/products/api/queries";
import {
  getPublishedReviews,
  getReviewAggregate,
} from "@/features/products/api/review-queries";
import { jsonContentToHtml, jsonContentToText } from "@/lib/editor-utils";
import { log } from "@/lib/logger";
import { createMetadata } from "@/lib/metadata";
import {
  getBreadcrumbSchema,
  getProductSchema,
  getReviewSchema,
} from "@/lib/seo/json-ld";
import { cn, formatPrice, getSiteUrl } from "@/lib/utils";
import { getCategoriesLink } from "../../e-shop/eshop-params";
import { AddWithQuantityButton } from "./add-with-quantity-button";
import { ProductRecommendations } from "./product-recommendations";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const allProducts = await getProducts();
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const urlDecoded = decodeURIComponent(slug);
  const products = await getProducts();
  const result = products.find((p) => p.slug === urlDecoded);

  if (!result) {
    notFound();
  }
  const descriptionText =
    jsonContentToText(result?.description) || "Popis produktu chýba";

  return createMetadata({
    title: result.name,
    description: descriptionText,
    image: result.imageUrl ?? undefined,
    canonicalUrl: getSiteUrl(`/product/${result.slug}`),
  });
}

/**
 * Compute product recommendations using blend strategy:
 * - Up to 6 products from same category (excluding current product)
 * - Fill remainder up to 8 total with popular products
 * - If no category, use popular-only
 */
function getProductRecommendations(
  currentProduct: Product,
  allProducts: Product[]
): Product[] {
  const MAX_SAME_CATEGORY = 6;
  const MAX_TOTAL = 8;

  // Filter active products, excluding current product
  const availableProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status === "active"
  );

  const recommendations: Product[] = [];
  const usedIds = new Set<string>();

  // Step 1: Add products from same category (up to MAX_SAME_CATEGORY)
  if (currentProduct.category?.slug) {
    const sameCategory = availableProducts.filter(
      (p) => p.category?.slug === currentProduct.category?.slug
    );
    const categoryPicks = sameCategory.slice(0, MAX_SAME_CATEGORY);
    recommendations.push(...categoryPicks);
    for (const p of categoryPicks) {
      usedIds.add(p.id);
    }
  }

  // Step 2: Fill remainder with popular products (already ordered by sortOrder, createdAt)
  const remaining = MAX_TOTAL - recommendations.length;
  if (remaining > 0) {
    const popularPicks = availableProducts
      .filter((p) => !usedIds.has(p.id))
      .slice(0, remaining);
    recommendations.push(...popularPicks);
  }

  return recommendations;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const urlDecoded = decodeURIComponent(slug);
  const products = await getProducts();
  const result = products.find((p) => p.slug === urlDecoded) ?? null;

  if (!result) {
    notFound();
  }

  const isInStock = result.status === "active";
  const pickupDates = result.category?.pickupDates;
  const hasPickupRestriction = pickupDates && pickupDates.length > 0;

  const descriptionHtml = jsonContentToHtml(result?.description);

  const recommendations = getProductRecommendations(result, products);

  const descriptionText =
    jsonContentToText(result?.description) || "Popis produktu chýba";

  let reviewAggregate: Awaited<ReturnType<typeof getReviewAggregate>> = null;
  let publishedReviews: Awaited<ReturnType<typeof getPublishedReviews>> = [];

  try {
    [reviewAggregate, publishedReviews] = await Promise.all([
      getReviewAggregate(result.id),
      getPublishedReviews(result.id, 10),
    ]);
  } catch (err) {
    log.db.error(
      { err, productId: result.id, slug: result.slug },
      "Failed to fetch review data for product page"
    );
  }

  const productSchema = getProductSchema({
    name: result.name,
    description: descriptionText,
    image: result.imageUrl,
    priceCents: result.priceCents,
    slug: result.slug,
    category: result.category?.name,
    isAvailable: isInStock,
    rating: reviewAggregate
      ? { value: reviewAggregate.averageRating, count: reviewAggregate.reviewCount }
      : null,
  });

  const reviewSchemas = publishedReviews.map((review) =>
    getReviewSchema({
      authorName: review.user.name,
      rating: review.rating,
      reviewBody: review.content,
      datePublished: review.createdAt,
      productName: result.name,
      productSlug: result.slug,
    })
  );

  const breadcrumbItems = [
    { name: "E-shop", href: "/e-shop" },
    ...(result.category
      ? [
          {
            name: result.category.name,
            href: `/e-shop?category=${result.category.slug}`,
          },
        ]
      : []),
    { name: result.name },
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <PageWrapper>
      <JsonLd data={[productSchema, breadcrumbSchema, ...reviewSchemas]} />
      <AppBreadcrumbs
        items={[{ label: "E-shop", href: "/e-shop" }, { label: result.name }]}
      />
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-x-12 md:grid-cols-5">
        <div className="col-span-1 md:col-span-2">
          <div className="aspect-square rounded-sm">
            <ProductImage
              alt={`Product image: ${result.name}`}
              className={cn(
                "aspect-square size-full rounded-sm object-cover object-center transition-all duration-300"
              )}
              decoding="sync"
              height={500}
              loading="eager"
              preload
              quality={80}
              src={result.imageUrl ?? ""}
              width={500}
            />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 sm:col-span-2 md:col-span-3">
          {/* Product Title and Categories*/}
          {result.category ? (
            <div className="flex flex-wrap items-center justify-start gap-1">
              <Hint side="top" text="Kategórie">
                <TagsIcon className="size-4 text-muted-foreground" />
              </Hint>
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "xs" }),
                  "rounded-full"
                )}
                href={getCategoriesLink({ category: result.category.slug })}
                key={result.category.id}
                scroll={false}
              >
                {result.category.name}
              </Link>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <h1 className="line-clamp-2 font-semibold text-2xl leading-tight tracking-tight md:text-3xl">
              {result.name}
            </h1>
            <Suspense fallback={<Skeleton className="size-6" />}>
              <FavoriteButton
                className="[&_svg:not([class*='size-'])]:size-6"
                productId={result.id}
                size="icon-lg"
                variant="ghost"
              />
            </Suspense>
          </div>

          {/* Product Price and Features */}
          <p className="font-semibold text-2xl tracking-tight md:text-4xl">
            {formatPrice(result.priceCents)}
          </p>
          <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center">
            {isInStock ? (
              <Badge className="w-fit" variant="success">
                <CheckCircleIcon />
                Skladom
              </Badge>
            ) : (
              <Badge className="w-fit" variant="destructive">
                <ClockIcon />
                Nie je skladom
              </Badge>
            )}
            {hasPickupRestriction && (
              <div className="flex flex-row flex-wrap items-center gap-1">
                <Hint text="Dostupné len v týchto dňoch">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                </Hint>
                {pickupDates.map((date) => (
                  <Badge key={date} size="xs" variant="secondary">
                    {format(date, "dd. MMM", { locale: sk })}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grow">
            <div
              className="prose prose-stone dark:prose-invert prose-p:mb-4 max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted content from admin editor
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <Separator />
          <div className="flex w-full items-center justify-between gap-2">
            <AddWithQuantityButton disabled={!isInStock} id={result.id} />
          </div>
        </div>
      </section>
      {recommendations.length > 0 && (
        <section
          aria-labelledby="product-recommendations"
          className="mt-12 flex flex-col gap-4"
        >
          <h2
            className="font-semibold text-2xl tracking-tight"
            id="product-recommendations"
          >
            Mohlo by vás tiež zaujať
          </h2>
          <ProductRecommendations recommendations={recommendations} />
        </section>
      )}
    </PageWrapper>
  );
}
