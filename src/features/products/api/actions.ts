"use server";

import { eq, inArray, not } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prices, products } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { logActivity } from "@/features/activity-log/api/log";
import {
  type UpdateProductSchema,
  updateProductSchema,
} from "@/features/products/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

export async function updateProductAction({
  id,
  product,
}: {
  id: string;
  product: UpdateProductSchema;
}) {
  const admin = await requireAdmin();

  const parsed = updateProductSchema.safeParse(product);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  // Remove id from update data since it's used in the where clause
  const { id: _id, ...updateData } = parsed.data;

  // Get current product to check for slug changes
  const currentProduct = await db.query.products.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, id),
    columns: { slug: true, name: true, status: true },
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

  const isArchiving =
    updateData.status === "archived" && currentProduct?.status !== "archived";
  logActivity({
    action: isArchiving ? "product.archived" : "product.updated",
    entityType: "product",
    entityId: id,
    actor: { id: admin.id, type: "staff", label: admin.name },
    summary: `${isArchiving ? "Produkt archivovaný" : "Úprava produktu"} · ${updateData.name}`,
  });

  return { success: true };
}

export async function createDraftProductAction() {
  const admin = await requireAdmin();

  const [newDraftProduct] = await db
    .insert(products)
    .values({})
    .returning({ id: products.id });

  // Invalidate public cache
  updateTag("products");

  logActivity({
    action: "product.created",
    entityType: "product",
    entityId: newDraftProduct.id,
    actor: { id: admin.id, type: "staff", label: admin.name },
    summary: "Nový produkt (koncept)",
  });

  redirect(`/admin/eshop/products/${newDraftProduct.id}`);
}

export async function copyProductAction({ productId }: { productId: string }) {
  const admin = await requireAdmin();

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
    return { success: false, error: "NOT_FOUND" };
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

  let newProductId: string;
  try {
    const [newProduct] = await db
      .insert(products)
      .values({ ...newProductData })
      .returning({ id: products.id, slug: products.slug });
    newProductId = newProduct.id;

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

    logActivity({
      action: "product.created",
      entityType: "product",
      entityId: newProduct.id,
      actor: { id: admin.id, type: "staff", label: admin.name },
      summary: `Nový produkt · ${referenceProduct.name} (kópia)`,
    });
  } catch (err) {
    log.products.error({ err, productId }, "Copy product failed");
    return { success: false, error: "COPY_FAILED" };
  }

  // redirect() must stay outside the try/catch — it throws NEXT_REDIRECT.
  redirect(`/admin/eshop/products/${newProductId}`);
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
