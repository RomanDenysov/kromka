"use server";

import { eq, inArray, not } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prices, products } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import {
  updateProductSchema,
  type UpdateProductSchema,
} from "@/features/products/schema";
import { requireAdmin } from "@/lib/auth/guards";

export async function updateProductAction({
  id,
  product,
}: {
  id: string;
  product: UpdateProductSchema;
}) {
  await requireAdmin();

  const parsed = updateProductSchema.safeParse(product);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  // Remove id from update data since it's used in the where clause
  const { id: _id, ...updateData } = parsed.data;

  // Get current product to check for slug changes
  const currentProduct = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, id),
    columns: { slug: true },
  });

  // Check if slug is taken by another product
  if (updateData.slug) {
    const slugToCheck = updateData.slug;
    const existingProduct = await db.query.products.findFirst({
      where: (p, { and: andFn, eq: eqFn, ne }) =>
        andFn(eqFn(p.slug, slugToCheck), ne(p.id, id)),
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
  await requireAdmin();

  const [newDraftProduct] = await db
    .insert(products)
    .values({})
    .returning({ id: products.id });

  // Invalidate public cache
  updateTag("products");

  redirect(`/admin/products/${newDraftProduct.id}`);
}

export async function copyProductAction({ productId }: { productId: string }) {
  await requireAdmin();

  const referenceProduct = await db.query.products.findFirst({
    where: (product, { eq: eqFn }) => eqFn(product.id, productId),
    with: {
      category: true,
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
    imageId: referenceProduct.imageId,
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

  // Invalidate public cache
  updateTag("products");
  updateTag("categories"); // Categories depend on products
  if (newProduct.slug) {
    updateTag(`product-${newProduct.slug}`);
  }

  redirect(`/admin/products/${newProduct.id}`);
}

export async function toggleIsActiveProductAction({ id }: { id: string }) {
  await requireAdmin();

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

export async function deleteProductsAction({ ids }: { ids: string[] }) {
  await requireAdmin();

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
