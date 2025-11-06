import "server-only";
import { eq, not } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { CreateProductWithRelations, Product } from "@/db/schemas";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";

const DRAFT_DEFAULTS = Object.freeze({
  name: "New Product",
  description: "New Product Description",
  stock: 0,
  status: "draft" as const,
  isActive: false,
  sortOrder: 0,
});

function createDraftProductData(
  overrides: Partial<CreateProductWithRelations> = {}
): CreateProductWithRelations {
  return {
    ...DRAFT_DEFAULTS,
    prices: [],
    categories: [],
    channels: [],
    slug: `${getSlug("new-product")}-${createShortId()}`,
    sku: `SKU-${createShortId()}`,
    ...overrides,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_PRODUCT: async (): Promise<Product> => {
      const draft = createDraftProductData();
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("CREATE_DRAFT_PRODUCT", draft);
      const [newDraftProduct] = await db
        .insert(products)
        .values(draft)
        .returning();
      return newDraftProduct as Product;
    },
    UPDATE_PRODUCT: async (
      productId: string,
      product: CreateProductWithRelations
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
  },
};
