"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { UpdateProductSchema } from "@/validation/products";
import { getAuth } from "../auth/session";

export async function updateProductAction({
  id,
  product,
}: {
  id: string;
  product: UpdateProductSchema;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Remove id from update data since it's used in the where clause
  const { id: _id, ...updateData } = product;

  await db.update(products).set(updateData).where(eq(products.id, id));

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");

  return { success: true };
}
