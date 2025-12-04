import { cache } from "react";
import { db } from "@/db";

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.query.products.findFirst({
    where: (p, { eq, and, inArray }) =>
      and(
        eq(p.slug, slug),
        eq(p.isActive, true),
        inArray(p.status, ["active", "sold"])
      ),
    with: {
      images: {
        with: {
          media: true,
        },
      },
      // TODO: update later when we will remove multiple categories
      category: true,
    },
  });

  if (product) {
    product.images = product.images.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...product,
      images: product.images.map((img) => img.media.url),
    };
  }

  return null;
});
