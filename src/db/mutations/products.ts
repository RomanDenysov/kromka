import "server-only";
import { and, eq, not } from "drizzle-orm";
import { db } from "@/db";
import {
  media,
  prices,
  productChannels,
  productImages,
  products,
} from "@/db/schema";

type ProductInsert = typeof products.$inferInsert;

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_PRODUCT: async (): Promise<{ id: string }> => {
      const [newDraftProduct] = await db
        .insert(products)
        .values({})
        .returning({ id: products.id });

      await db.insert(productChannels).values({
        productId: newDraftProduct.id,
        channel: "B2C",
        isListed: false,
      });

      await db.insert(prices).values({
        productId: newDraftProduct.id,
        channel: "B2C",
        amountCents: 0,
        minQty: 1,
        priority: 0,
        isActive: true,
        startsAt: null,
        endsAt: null,
      });

      return { id: newDraftProduct.id };
    },
    COPY_PRODUCT: async (productId: string): Promise<{ id: string }> => {
      const referenceProduct = await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, productId),
      });

      if (!referenceProduct) {
        throw new Error("Product not found");
      }

      const newProductData = {
        ...referenceProduct,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const [newProduct] = await db
        .insert(products)
        .values(newProductData)
        .returning({ id: products.id });

      return { id: newProduct.id };
    },
    UPDATE_PRODUCT: async (
      productId: string,
      product: Partial<ProductInsert>
    ): Promise<{ id: string }> => {
      const [updatedProduct] = await db
        .update(products)
        .set(product)
        .where(eq(products.id, productId))
        .returning({ id: products.id });
      return updatedProduct;
    },

    TOGGLE_IS_ACTIVE: async (productId: string) =>
      await db
        .update(products)
        .set({ isActive: not(products.isActive) })
        .where(eq(products.id, productId))
        .returning({ id: products.id }),

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
          isPrimary: sortOrder === 0, // First image is primary
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
      // Update sortOrder for all images in a transaction
      await db.transaction(async (tx) => {
        // biome-ignore lint/nursery/noIncrementDecrement: <explanation>
        for (let index = 0; index < mediaIds.length; index++) {
          await tx
            .update(productImages)
            .set({ sortOrder: index })
            .where(
              and(
                eq(productImages.productId, productId),
                eq(productImages.mediaId, mediaIds[index])
              )
            );
        }
      });

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
