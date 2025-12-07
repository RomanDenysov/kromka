import "server-only";
import { db } from "@/db";
import { getAuth } from "../auth/session";

export async function getCart() {
  const { user, session } = await getAuth();

  if (!(user && session)) {
    return null;
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn, isNull }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        isNull(cartTable.companyId)
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
                with: { media: { columns: { url: true } } },
                orderBy: (img, { asc }) => [asc(img.sortOrder)],
              },
              category: {
                columns: { name: true, pickupDates: true },
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

  return {
    id: cart.id,
    userId: cart.userId,
    companyId: cart.companyId,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.items.map((item) => ({
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      priceCents: item.product.priceCents,
      product: {
        ...item.product,
        images: item.product.images.map((img) => img.media.url),
      },
    })),
  };
}

export type Cart = NonNullable<Awaited<ReturnType<typeof getCart>>>;
export type CartItem = Cart["items"][number];
export type CartProduct = CartItem["product"];
