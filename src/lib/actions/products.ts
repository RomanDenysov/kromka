"use server";

import { and, eq, inArray, not } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { media, prices, productImages, products } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import type { UpdateProductSchema } from "@/validation/products";
import { getAuth } from "../auth/session";

export async function updateProductAction({
  id,
  product,
}: {
  id: string;
  product: UpdateProductSchema;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Remove id from update data since it's used in the where clause
  const { id: _id, ...updateData } = product;

  // Get current product to check for slug changes
  const currentProduct = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, id),
    columns: { slug: true },
  });

  // Check if slug is taken by another product
  if (updateData.slug) {
    const existingProduct = await db.query.products.findFirst({
      where: (p, { and: andFn, eq: eqFn, ne }) =>
        andFn(eqFn(p.slug, updateData.slug as string), ne(p.id, id)),
      columns: { id: true },
    });

    if (existingProduct) {
      return { success: false, error: "SLUG_TAKEN" };
    }
  }

  await db.update(products).set(updateData).where(eq(products.id, id));

  // Invalidate public cache
  updateTag("products");
  updateTag("categories"); // Categories depend on products
  // Invalidate old slug if it changed
  if (currentProduct?.slug) {
    updateTag(`product-${currentProduct.slug}`);
  }
  // Invalidate new slug
  if (product.slug) {
    updateTag(`product-${product.slug}`);
  }

  return { success: true };
}

export async function createDraftProductAction() {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [newDraftProduct] = await db
    .insert(products)
    .values({})
    .returning({ id: products.id });

  // Invalidate public cache
  updateTag("products");

  redirect(`/admin/products/${newDraftProduct.id}`);
}

export async function copyProductAction({ productId }: { productId: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const referenceProduct = await db.query.products.findFirst({
    where: (product, { eq: eqFn }) => eqFn(product.id, productId),
    with: {
      category: true,
      images: true,
      prices: {
        with: {
          priceTier: true,
        },
      },
    },
  });

  if (!referenceProduct) {
    throw new Error("Product not found");
  }

  const newProductData = {
    name: referenceProduct.name,
    slug: draftSlug(referenceProduct.name),
    description: referenceProduct.description,
    isActive: false,
    sortOrder: referenceProduct.sortOrder,
    status: referenceProduct.status,
    categoryId: referenceProduct.category?.id ?? null,
  };

  const [newProduct] = await db
    .insert(products)
    .values({ ...newProductData })
    .returning({ id: products.id, slug: products.slug });

  // Batch insert prices
  if (referenceProduct.prices.length > 0) {
    await db.insert(prices).values(
      referenceProduct.prices.map(({ priceCents, priceTierId }) => ({
        productId: newProduct.id,
        priceTierId,
        priceCents,
      }))
    );
  }

  // Batch insert images
  if (referenceProduct.images.length > 0) {
    await db.insert(productImages).values(
      referenceProduct.images.map(({ mediaId, sortOrder }) => ({
        productId: newProduct.id,
        mediaId,
        sortOrder,
      }))
    );
  }

  // Invalidate public cache
  updateTag("products");
  updateTag("categories"); // Categories depend on products
  if (newProduct.slug) {
    updateTag(`product-${newProduct.slug}`);
  }

  redirect(`/admin/products/${newProduct.id}`);
}

export async function toggleIsActiveProductAction({ id }: { id: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [updatedProduct] = await db
    .update(products)
    .set({ isActive: not(products.isActive) })
    .where(eq(products.id, id))
    .returning({ id: products.id, slug: products.slug });

  // Invalidate public cache
  updateTag("products");
  updateTag("categories");
  if (updatedProduct.slug) {
    updateTag(`product-${updatedProduct.slug}`);
  }

  return { id: updatedProduct.id };
}

export async function uploadProductImageAction({
  productId,
  blobUrl,
  metadata,
}: {
  productId: string;
  blobUrl: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    filename: string;
  };
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Create media record
  // Store the full URL in the path field for easy access
  const [mediaRecord] = await db
    .insert(media)
    .values({
      name: metadata.filename,
      url: blobUrl,
      path: blobUrl, // Store full URL for easy access
      type: "image/jpeg",
      size: metadata.size,
    })
    .returning();

  // Get current image count to determine sortOrder
  const existingImages = await db.query.productImages.findMany({
    where: (image, { eq: eqFn }) => eqFn(image.productId, productId),
  });

  const sortOrder = existingImages.length;

  // Create productImages record
  await db.insert(productImages).values({
    productId,
    mediaId: mediaRecord.id,
    sortOrder,
  });

  // Return with media relation
  const productImage = await db.query.productImages.findFirst({
    where: (image, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(image.productId, productId),
        eqFn(image.mediaId, mediaRecord.id)
      ),
    with: {
      media: true,
    },
  });

  // Get product slug for cache invalidation
  const product = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, productId),
    columns: { slug: true },
  });

  // Invalidate public cache
  updateTag("products");
  if (product?.slug) {
    updateTag(`product-${product.slug}`);
  }

  return productImage;
}

export async function updateImageSortOrderAction({
  productId,
  mediaIds,
}: {
  productId: string;
  mediaIds: string[];
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Update sortOrder for all images
  for (let index = 0; index < mediaIds.length; index++) {
    await db
      .update(productImages)
      .set({ sortOrder: index })
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.mediaId, mediaIds[index])
        )
      );
  }

  // Return updated images
  const updatedImages = await db.query.productImages.findMany({
    where: (productImage, { eq: eqFn }) =>
      eqFn(productImage.productId, productId),
    orderBy: (productImagesTable, { asc }) => [
      asc(productImagesTable.sortOrder),
    ],
    with: {
      media: true,
    },
  });

  // Get product slug for cache invalidation
  const product = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, productId),
    columns: { slug: true },
  });

  // Invalidate public cache
  updateTag("products");
  if (product?.slug) {
    updateTag(`product-${product.slug}`);
  }

  return updatedImages;
}

export async function deleteProductImageAction({
  productId,
  mediaId,
}: {
  productId: string;
  mediaId: string;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Delete productImages record (cascade will delete media)
  await db
    .delete(productImages)
    .where(
      and(
        eq(productImages.productId, productId),
        eq(productImages.mediaId, mediaId)
      )
    );

  // Also delete media record explicitly
  await db.delete(media).where(eq(media.id, mediaId));

  // Get product slug for cache invalidation
  const product = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, productId),
    columns: { slug: true },
  });

  // Invalidate public cache
  updateTag("products");
  if (product?.slug) {
    updateTag(`product-${product.slug}`);
  }

  return { success: true };
}

export async function getProductImagesAction({
  productId,
}: {
  productId: string;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const images = await db.query.productImages.findMany({
    where: (image, { eq: eqFn }) => eqFn(image.productId, productId),
    orderBy: (productImagesTable, { asc }) => [
      asc(productImagesTable.sortOrder),
    ],
    with: {
      media: true,
    },
  });

  return images;
}

export async function deleteProductsAction({ ids }: { ids: string[] }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const deletedProducts = await db
    .delete(products)
    .where(inArray(products.id, ids))
    .returning({ id: products.id, slug: products.slug });

  // Invalidate public cache
  updateTag("products");
  updateTag("categories");
  for (const product of deletedProducts) {
    if (product.slug) {
      updateTag(`product-${product.slug}`);
    }
  }

  refresh();
}
