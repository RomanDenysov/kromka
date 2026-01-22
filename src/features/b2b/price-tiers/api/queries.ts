import "server-only";

import { db } from "@/db";

export async function getPriceTiers() {
  return db.query.priceTiers.findMany({
    orderBy: (tier, { asc }) => asc(tier.name),
  });
}

export async function getPriceTierById(id: string) {
  return db.query.priceTiers.findFirst({
    where: (tier, { eq: eqOp }) => eqOp(tier.id, id),
    with: {
      prices: {
        with: {
          product: {
            columns: { id: true, name: true, slug: true, priceCents: true },
            with: {
              image: {
                columns: { url: true },
              },
            },
          },
        },
      },
    },
  });
}

export type PriceTier = NonNullable<
  Awaited<ReturnType<typeof getPriceTiers>>[number]
>;
