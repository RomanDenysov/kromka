import { StarHalfIcon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STAR_COUNT = 5;

interface StarRatingProps {
  className?: string;
  /** Number of reviews; shown in parentheses when provided. */
  count?: number;
  /** Average rating, 0-5. */
  rating: number;
  size?: "sm" | "md";
}

/**
 * Presentational star rating. Rounds to the nearest half star.
 * Used on the product page and cards to surface social proof.
 */
export function StarRating({
  rating,
  count,
  className,
  size = "md",
}: StarRatingProps) {
  const rounded = Math.round(rating * 2) / 2;
  const starSize = size === "sm" ? "size-3.5" : "size-4";
  const label =
    count == null
      ? `Hodnotenie ${rating.toFixed(1)} z 5`
      : `Hodnotenie ${rating.toFixed(1)} z 5, ${count} hodnotení`;

  return (
    <div
      aria-label={label}
      className={cn("flex items-center gap-1.5", className)}
      role="img"
    >
      <div aria-hidden className="flex items-center gap-0.5">
        {Array.from({ length: STAR_COUNT }, (_, index) => {
          const position = index + 1;
          const isFull = rounded >= position;
          const isHalf = !isFull && rounded >= position - 0.5;

          if (isHalf) {
            return (
              <StarHalfIcon
                className={cn(starSize, "fill-yellow-500 text-yellow-500")}
                key={position}
              />
            );
          }

          return (
            <StarIcon
              className={cn(
                starSize,
                isFull
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-muted text-muted-foreground/40"
              )}
              key={position}
            />
          );
        })}
      </div>
      <span className="font-medium text-sm tabular-nums">
        {rating.toFixed(1)}
      </span>
      {count != null && (
        <span className="text-muted-foreground text-sm">({count})</span>
      )}
    </div>
  );
}
