"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema/products";

export async function createDraftProduct() {
  const [result] = await db
    .insert(products)
    .values({})
    .returning({ id: products.id });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${result.id}`);
}
