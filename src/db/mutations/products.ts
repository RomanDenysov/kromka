import "server-only";
import { and, eq, not } from "drizzle-orm";
import { db } from "@/db";
import { media, productImages, products } from "@/db/schema";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";

type ProductInsert = typeof products.$inferInsert;
type Product = typeof products.$inferSelect;

const DRAFT_DEFAULTS = Object.freeze({
  name: "Nový produkt",
  description: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Popis nového produktu..." }],
      },
    ],
  },
  stock: 0,
  status: "draft" as const,
  isActive: false,
  sortOrder: 0,
});

function createDraftProductData(
  overrides: Partial<ProductInsert> = {}
): ProductInsert {
  return {
    ...DRAFT_DEFAULTS,
    slug: `${getSlug(DRAFT_DEFAULTS.name)}-${createShortId()}`,
    sku: `SKU-${createShortId()}`,
    ...overrides,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_PRODUCT: async (): Promise<Product> => {
      const draft = createDraftProductData();
      // biome-ignore lint/suspicious/noConsole: Debug logging
      console.log("CREATE_DRAFT_PRODUCT", draft);
      const [newDraftProduct] = await db
        .insert(products)
        .values({ ...draft })
        .returning();
      return newDraftProduct;
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
