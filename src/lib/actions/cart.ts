// lib/actions/cart.ts
"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { getAuth } from "@/lib/auth/session";

/**
 * Ensures a user exists for cart operations.
 * Creates an anonymous user if no session exists.
 */
async function ensureUser() {
  const authResult = await getAuth();

  if (authResult.user) {
    return authResult;
  }

  // Create anonymous user on first cart interaction
  const result = await auth.api.signInAnonymous({
    headers: await headers(),
  });

  if (!result?.user) {
    throw new Error("Failed to create session");
  }

  // Query fresh user data with relations (matching getAuth structure)
  const user = await db.query.users.findFirst({
    where: (u, { eq: eqFn }) => eqFn(u.id, result.user.id),
    with: {
      store: true,
      members: {
        with: { organization: true },
      },
    },
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    // Anonymous users don't have organizations, so session structure is minimal
    session: { session: { activeOrganizationId: null }, user: result.user },
    user,
    isAuthenticated: false,
    isAnonymous: true,
    store: user.store ?? null,
    organization: null,
  } as const;
}

export async function addToCart(productId: string, quantity: number) {
  const { user, session } = await ensureUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const companyId = session?.session?.activeOrganizationId ?? null;

  // Verify product
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true, showInB2b: true, isActive: true },
  });

  if (!product?.isActive) {
    throw new Error("Product not found");
  }
  if (companyId && !product.showInB2b) {
    throw new Error("Product not available for B2B");
  }

  // Get or create cart
  let cart = await db.query.carts.findFirst({
    where: (t, { eq: eqFn, and: andFn }) =>
      companyId
        ? andFn(eqFn(t.userId, user.id), eqFn(t.companyId, companyId))
        : andFn(eqFn(t.userId, user.id), sql`${t.companyId} IS NULL`),
    columns: { id: true },
  });

  if (!cart) {
    const [newCart] = await db
      .insert(carts)
      .values({ userId: user.id, companyId })
      .returning({ id: carts.id });
    cart = newCart;
  }

  // Upsert cart item
  await db
    .insert(cartItems)
    .values({ cartId: cart.id, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
    });

  revalidatePath("/", "layout");
}

export async function removeFromCart(productId: string) {
  const { user, session } = await getAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const companyId = session?.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (t, { eq: eqFn, and: andFn, isNull }) =>
      companyId
        ? andFn(eqFn(t.userId, user.id), eqFn(t.companyId, companyId))
        : andFn(eqFn(t.userId, user.id), isNull(t.companyId)),
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

  revalidatePath("/", "layout");
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
) {
  const { user, session } = await getAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (quantity < 0) {
    throw new Error("Invalid quantity");
  }

  const companyId = session?.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (t, { eq: eqFn, and: andFn }) =>
      companyId
        ? andFn(eqFn(t.userId, user.id), eqFn(t.companyId, companyId))
        : andFn(eqFn(t.userId, user.id), sql`${t.companyId} IS NULL`),
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

  revalidatePath("/", "layout");
}
