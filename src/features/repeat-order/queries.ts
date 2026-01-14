import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export function getLastOrderWithItems(orderId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              priceCents: true,
              status: true,
            },
            with: {
              image: {
                columns: {
                  url: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
