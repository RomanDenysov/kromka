"use server";

import { and, eq, inArray, not } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
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

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");

  updateTag("products");
  updateTag(`product-${product.slug}`);

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

  revalidatePath(`/admin/products/${newDraftProduct.id}`);
  revalidatePath("/admin/products");

  updateTag("products");

  return { id: newDraftProduct.id };
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
    .returning({ id: products.id });

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

  revalidatePath(`/admin/products/${newProduct.id}`);
  revalidatePath("/admin/products");

  return { id: newProduct.id };
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
    .returning({ id: products.id });

  revalidatePath(`/admin/products/${updatedProduct.id}`);
  revalidatePath("/admin/products");

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

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");

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
  // biome-ignore lint/nursery/noIncrementDecrement: Ignore it for now
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

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");

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

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");

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
    .returning({ id: products.id });

  // TODO: DELETE IT AFTER RELEASE
  // biome-ignore lint/complexity/noForEach: We need to revalidate the paths for each product
  deletedProducts.forEach((product) => {
    revalidatePath(`/admin/products/${product.id}`);
  });

  revalidatePath("/admin/products");

  return {
    success: true,
    ids: deletedProducts.map((product) => product.id),
  };
}
