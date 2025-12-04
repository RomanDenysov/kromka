"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getAuth } from "../auth/session";

export async function getMediaByIdAction({ id }: { id: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return await db.query.media.findFirst({
    where: (mediaTable, { eq: eqFn }) => eqFn(mediaTable.id, id),
  });
}

export async function uploadMediaAction({
  name,
  url,
  path,
  type,
  size,
}: {
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const results = await db
    .insert(media)
    .values({
      name,
      path,
      url,
      type,
      size,
    })
    .returning();

  revalidatePath("/admin/media");

  return results;
}
