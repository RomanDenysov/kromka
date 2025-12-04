import { db } from "@/db";

export async function getMedia() {
  return await db.query.media.findMany({
    orderBy: (mediaTable, { desc }) => [desc(mediaTable.createdAt)],
    with: {
      productImages: {
        with: {
          product: true,
        },
      },
      stores: true,
      categories: true,
      posts: true,
    },
  });
}

export async function getMediaById(id: string) {
  return await db.query.media.findFirst({
    where: (mediaTable, { eq }) => eq(mediaTable.id, id),
    with: {
      productImages: {
        with: {
          product: true,
        },
      },
      stores: true,
      categories: true,
      posts: true,
    },
  });
}

export type MediaListType = Awaited<ReturnType<typeof getMedia>>;
export type MediaType = Awaited<ReturnType<typeof getMediaById>>;
