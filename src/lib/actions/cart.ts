"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, organizations, prices, products } from "@/db/schema";
import { getAuth } from "../auth/session";

/**
 * Get the price for a product based on company's price tier and quantity
 */
export async function getProductPrice(
  productId: string,
  companyId: string | null,
  quantity: number
): Promise<number> {
  if (!companyId) {
    // B2C: use product's default price
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { priceCents: true },
    });
    return product?.priceCents ?? 0;
  }

  // B2B: get organization's price tier
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, companyId),
    columns: { priceTierId: true },
    with: {
      priceTier: true,
    },
  });

  if (!org?.priceTierId) {
    // No price tier: fallback to default price
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { priceCents: true },
    });
    return product?.priceCents ?? 0;
  }

  // Find the best matching price tier (highest minQty <= quantity)
  const tierPrices = await db.query.prices.findMany({
    where: and(
      eq(prices.productId, productId),
      eq(prices.priceTierId, org.priceTierId),
      sql`${prices.minQty} <= ${quantity}`
    ),
    orderBy: [desc(prices.minQty)],
    limit: 1,
  });

  if (tierPrices.length > 0 && tierPrices[0]) {
    return tierPrices[0].priceCents;
  }

  // Fallback to default price
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { priceCents: true },
  });
  return product?.priceCents ?? 0;
}

/**
 * Get or create cart for user and company
 */
export async function getCart() {
  const { user, session } = await getAuth();
  if (!(user && session)) {
    return null;
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        sql`${cartTable.companyId} IS NULL`
      );
    },
    with: {
      items: {
        orderBy: (item, { asc }) => [asc(item.productId)],
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              priceCents: true,
              showInB2b: true,
            },
            with: {
              images: {
                with: {
                  media: true,
                },
                orderBy: (
                  image: { sortOrder: number },
                  { asc: AscFn }: { asc: (column: number) => number }
                ) => [asc(image.sortOrder)],
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return null;
  }

  // Calculate prices based on B2B pricing if companyId exists
  const itemsWithPrices = await Promise.all(
    cart.items.map(async (item) => {
      const priceCents = await getProductPrice(
        item.productId,
        companyId,
        item.quantity
      );

      if (!item.product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const product = item.product;
      const productImages = product.images.map((img) => ({
        url: img.media.url,
      }));

      return {
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        priceCents,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          priceCents: product.priceCents,
          showInB2b: product.showInB2b,
          images: productImages,
        },
      };
    })
  );

  return {
    ...cart,
    items: itemsWithPrices,
  };
}

/**
 * Add item to cart
 */
export async function addToCart(productId: string, quantity: number) {
  const { user, session } = await getAuth();
  if (!(user && session)) {
    throw new Error("Unauthorized");
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  // Verify product exists and is available for B2B if companyId exists
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: {
      id: true,
      showInB2b: true,
      isActive: true,
    },
  });

  if (!product?.isActive) {
    throw new Error("Product not found");
  }

  if (companyId && !product.showInB2b) {
    throw new Error("Product not available for B2B");
  }

  // Get or create cart
  let cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        sql`${cartTable.companyId} IS NULL`
      );
    },
    columns: { id: true },
  });

  if (!cart) {
    const [newCart] = await db
      .insert(carts)
      .values({
        userId: user.id,
        companyId,
      })
      .returning({ id: carts.id });
    cart = newCart;
  }

  // Add or update cart item
  await db
    .insert(cartItems)
    .values({
      cartId: cart.id,
      productId,
      quantity,
    })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: {
        quantity: sql`${cartItems.quantity} + ${quantity}`,
      },
    });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: string) {
  const { user, session } = await getAuth();
  if (!(user && session)) {
    throw new Error("Unauthorized");
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        sql`${cartTable.companyId} IS NULL`
      );
    },
    columns: { id: true },
  });

  if (!cart) {
    return;
  }

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
    );
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  productId: string,
  quantity: number
) {
  const { user, session } = await getAuth();
  if (!(user && session)) {
    throw new Error("Unauthorized");
  }

  if (quantity < 0) {
    throw new Error("Quantity must be non-negative");
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        sql`${cartTable.companyId} IS NULL`
      );
    },
    columns: { id: true },
  });

  if (!cart) {
    return;
  }

  if (quantity === 0) {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
      );
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
      );
  }
}
