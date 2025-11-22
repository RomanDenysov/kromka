import "server-only";
import { and, eq, not } from "drizzle-orm";
import { db } from "@/db";
import {
  media,
  prices,
  productCategories,
  productImages,
  products,
} from "@/db/schema";
import { draftSlug } from "../utils";

type ProductInsert = typeof products.$inferInsert;

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_PRODUCT: async (): Promise<{ id: string }> => {
      const [newDraftProduct] = await db
        .insert(products)
        .values({})
        .returning({ id: products.id });

      return { id: newDraftProduct.id };
    },
    COPY_PRODUCT: async (productId: string): Promise<{ id: string }> => {
      const referenceProduct = await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, productId),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
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
        stock: referenceProduct.stock,
        isActive: false,
        sortOrder: referenceProduct.sortOrder,
        status: referenceProduct.status,
      };

      const [newProduct] = await db
        .insert(products)
        .values({ ...newProductData })
        .returning({ id: products.id });

      // Batch insert prices
      if (referenceProduct.prices.length > 0) {
        await db.insert(prices).values(
          referenceProduct.prices.map(
            ({ priceCents, priceTierId, minQty }) => ({
              productId: newProduct.id,
              priceTierId,
              priceCents,
              minQty,
            })
          )
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

      // Batch insert categories
      if (referenceProduct.categories.length > 0) {
        await db.insert(productCategories).values(
          referenceProduct.categories.map(({ categoryId, sortOrder }) => ({
            productId: newProduct.id,
            categoryId,
            sortOrder: sortOrder ?? 0,
          }))
        );
      }

      return { id: newProduct.id };
    },
    UPDATE_PRODUCT: async (
      productId: string,
      product: Partial<ProductInsert> & { categoryIds?: string[] }
    ): Promise<{ id: string }> => {
      const { categoryIds, ...productData } = product;

      if (Object.keys(productData).length > 0) {
        await db
          .update(products)
          .set(productData)
          .where(eq(products.id, productId));
      }

      if (categoryIds) {
        await db
          .delete(productCategories)
          .where(eq(productCategories.productId, productId));

        if (categoryIds.length > 0) {
          await db.insert(productCategories).values(
            categoryIds.map((categoryId) => ({
              productId,
              categoryId,
              sortOrder: 0,
            }))
          );
        }
      }

      return { id: productId };
    },

    TOGGLE_IS_ACTIVE: async (productId: string): Promise<{ id: string }> => {
      const [updatedProduct] = await db
        .update(products)
        .set({ isActive: not(products.isActive) })
        .where(eq(products.id, productId))
        .returning({ id: products.id });
      return { id: updatedProduct.id };
    },

    UPLOAD_PRODUCT_IMAGE: async (
      productId: string,
      blobUrl: string,
      _blobPath: string,
      metadata: {
        width: number;
        height: number;
        size: number;
        filename: string;
      }
    ) => {
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
        where: (productImage, { eq: eqFn }) =>
          eqFn(productImage.productId, productId),
      });

      const sortOrder = existingImages.length;

      // Create productImages record
      const [_productImageRecord] = await db
        .insert(productImages)
        .values({
          productId,
          mediaId: mediaRecord.id,
          sortOrder,
        })
        .returning();

      // Return with media relation
      return await db.query.productImages.findFirst({
        where: (productImage, { and: andFn, eq: eqFn }) =>
          andFn(
            eqFn(productImage.productId, productId),
            eqFn(productImage.mediaId, mediaRecord.id)
          ),
        with: {
          media: true,
        },
      });
    },

    UPDATE_IMAGE_SORT_ORDER: async (productId: string, mediaIds: string[]) => {
      // Update sortOrder for all images
      // biome-ignore lint/nursery/noIncrementDecrement: <explanation>
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
      return await db.query.productImages.findMany({
        where: (productImage, { eq: eqFn }) =>
          eqFn(productImage.productId, productId),
        orderBy: (productImagesTable, { asc }) => [
          asc(productImagesTable.sortOrder),
        ],
        with: {
          media: true,
        },
      });
    },

    DELETE_PRODUCT_IMAGE: async (productId: string, mediaId: string) => {
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

      return { success: true };
    },
  },
};
