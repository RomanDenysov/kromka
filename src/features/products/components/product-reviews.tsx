import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublishedReview } from "@/features/products/api/review-queries";
import { StarRating } from "./star-rating";

interface ProductReviewsProps {
  aggregate: { averageRating: number; reviewCount: number } | null;
  reviews: PublishedReview[];
}

/**
 * Customer reviews section for the product page. Renders the rating summary
 * plus the published reviews already fetched for the page (previously used
 * only for JSON-LD).
 */
export function ProductReviews({ reviews, aggregate }: ProductReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="product-reviews-heading"
      className="mt-12 flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className="font-semibold text-2xl tracking-tight"
          id="product-reviews-heading"
        >
          Hodnotenia zákazníkov
        </h2>
        {aggregate && (
          <StarRating
            count={aggregate.reviewCount}
            rating={aggregate.averageRating}
          />
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li
            className="flex flex-col gap-2 rounded-md border p-4"
            key={review.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {review.user.name ?? "Zákazník"}
                </span>
                {review.isVerifiedPurchase && (
                  <Badge size="xs" variant="secondary">
                    <BadgeCheckIcon className="size-3 text-brand" />
                    Overený nákup
                  </Badge>
                )}
              </div>
              <time
                className="text-muted-foreground text-xs"
                dateTime={format(review.createdAt, "yyyy-MM-dd")}
              >
                {format(review.createdAt, "d. M. yyyy", { locale: sk })}
              </time>
            </div>

            <StarRating rating={review.rating} size="sm" />

            {review.title && (
              <p className="font-medium text-sm">{review.title}</p>
            )}
            {review.content && (
              <p className="text-pretty text-foreground/80 text-sm leading-relaxed">
                {review.content}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
