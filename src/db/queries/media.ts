import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_MEDIA: async () =>
      await db.query.media.findMany({
        orderBy: (mediaTable, { desc }) => [desc(mediaTable.createdAt)],
        with: {
          productImages: {
            with: {
              product: true,
            },
          },
          stores: true,
        },
      }),
    GET_MEDIA_BY_ID: async (id: string) =>
      await db.query.media.findFirst({
        where: (mediaTable, { eq }) => eq(mediaTable.id, id),
        with: {
          productImages: {
            with: {
              product: true,
            },
          },
          stores: true,
        },
      }),
  },
};
