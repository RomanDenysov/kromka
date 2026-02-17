import "server-only";

import { and, avg, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { reviews } from "@/db/schema";

type ReviewAggregate = {
  averageRating: number;
  reviewCount: number;
};

export const getReviewAggregate = cache(
  async (productId: string): Promise<ReviewAggregate | null> => {
    "use cache";
    cacheLife("hours");
    cacheTag("reviews", `reviews-${productId}`);

    const [result] = await db
      .select({
        averageRating: avg(reviews.rating),
        reviewCount: count(),
      })
      .from(reviews)
      .where(
        and(eq(reviews.productId, productId), eq(reviews.isPublished, true))
      );

    if (!result || result.reviewCount === 0) {
      return null;
    }

    return {
      averageRating:
        Math.round(Number.parseFloat(result.averageRating ?? "0") * 10) / 10,
      reviewCount: result.reviewCount,
    };
  }
);

export const getPublishedReviews = cache(
  async (productId: string, limit = 10) => {
    "use cache";
    cacheLife("hours");
    cacheTag("reviews", `reviews-${productId}`);

    return db.query.reviews.findMany({
      where: (r, { and: andOp, eq: eqOp }) =>
        andOp(eqOp(r.productId, productId), eqOp(r.isPublished, true)),
      with: {
        user: {
          columns: { name: true },
        },
      },
      orderBy: [desc(reviews.createdAt)],
      limit,
    });
  }
);

export type PublishedReview = Awaited<
  ReturnType<typeof getPublishedReviews>
>[number];
